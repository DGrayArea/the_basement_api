use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your program ID

#[program]
pub mod hybrid_stake_pool {
    use super::*;

    /// Initializes the staking pool with an owner and API authority
    /// @param ctx - The context of accounts
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.pool_state;
        state.owner = ctx.accounts.owner.key();
        state.api_authority = ctx.accounts.api_authority.key();
        state.paused = false;
        state.total_shares = 0;
        state.fee_percentage = 0; // Default to 0%, can be updated later

        // Emit initialization event
        emit!(PoolInitialized {
            pool: ctx.accounts.pool_state.key(),
            owner: state.owner,
            api_authority: state.api_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Initiates a staking operation for a user and transfers SOL to the API wallet
    /// @param ctx - The context of accounts
    /// @param amount - The amount of SOL to stake
    pub fn initiate_stake(ctx: Context<InitiateStake>, amount: u64) -> Result<()> {
        // Ensure pool is not paused
        require!(!ctx.accounts.pool_state.paused, CustomError::PoolPaused);
        
        // Validate amount
        require!(amount > 0, CustomError::InvalidAmount);
        
        // Ensure user is the signer
        require!(
            ctx.accounts.user.key() == ctx.accounts.user_state.user || 
            ctx.accounts.user_state.user == Pubkey::default(),
            CustomError::Unauthorized
        );

        // Initialize or update user state
        let user_state = &mut ctx.accounts.user_state;
        
        // If this is a new user, set their user key
        if user_state.user == Pubkey::default() {
            user_state.user = ctx.accounts.user.key();
        }
        
        // Check if user is in a valid state to stake
        require!(
            user_state.status == StakeStatus::Completed || 
            user_state.status == StakeStatus::New,
            CustomError::InvalidState
        );

        // Ensure user has enough SOL (amount + rent)
        let user_lamports = ctx.accounts.user.lamports();
        require!(user_lamports >= amount, CustomError::InsufficientFunds);

        // Transfer SOL from user to the API wallet
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.api_wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        // Update user state
        user_state.pending_stake = amount;
        user_state.status = StakeStatus::Pending;
        user_state.last_update = Clock::get()?.unix_timestamp;

        // Emit stake initiated event
        emit!(StakeInitiated {
            user: user_state.user,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Processes a completed stake operation (called by API authority)
    /// @param ctx - The context of accounts
    /// @param tx_id - External transaction ID reference
    /// @param shares - Number of shares to mint for the user
    pub fn process_stake(ctx: Context<ProcessStake>, tx_id: String, shares: u64) -> Result<()> {
        // Ensure pool is not paused
        require!(!ctx.accounts.pool_state.paused, CustomError::PoolPaused);
        
        // Validate tx_id length to prevent excessive storage costs
        require!(tx_id.len() <= 64, CustomError::InvalidTxId);
        
        // Validate shares
        require!(shares > 0, CustomError::InvalidAmount);
        
        let user_state = &mut ctx.accounts.user_state;
        let pool_state = &mut ctx.accounts.pool_state;
        
        // Verify user is in pending state
        require!(user_state.status == StakeStatus::Pending, CustomError::InvalidState);

        // Update user state
        user_state.shares += shares;
        user_state.total_deposited += user_state.pending_stake;
        user_state.status = StakeStatus::Completed;
        user_state.last_tx = tx_id;
        user_state.last_update = Clock::get()?.unix_timestamp;
        
        // Update pool state
        pool_state.total_shares += shares;

        // Emit stake processed event
        emit!(StakeProcessed {
            user: user_state.user,
            amount: user_state.pending_stake,
            shares,
            tx_id: tx_id.clone(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Requests an unstake operation for a user
    /// @param ctx - The context of accounts
    /// @param percent - Percentage of shares to unstake (1-100)
    pub fn request_unstake(ctx: Context<RequestUnstake>, percent: u8) -> Result<()> {
        // Ensure pool is not paused
        require!(!ctx.accounts.pool_state.paused, CustomError::PoolPaused);
        
        // Validate percentage
        require!(percent > 0 && percent <= 100, CustomError::InvalidPercentage);
        
        let user_state = &mut ctx.accounts.user_state;
        
        // Verify user is the signer
        require!(ctx.accounts.user.key() == user_state.user, CustomError::Unauthorized);
        
        // Verify user state allows for unstaking
        require!(user_state.status == StakeStatus::Completed, CustomError::InvalidState);
        
        // Verify user has shares to unstake
        require!(user_state.shares > 0, CustomError::InsufficientShares);

        user_state.pending_unstake_pct = percent;
        user_state.status = StakeStatus::UnstakePending;
        user_state.last_update = Clock::get()?.unix_timestamp;

        // Calculate shares being unstaked for the event
        let shares_to_unstake = user_state.shares.checked_mul(percent as u64)
            .ok_or(CustomError::MathOverflow)?
            .checked_div(100)
            .ok_or(CustomError::MathOverflow)?;

        // Emit unstake requested event
        emit!(UnstakeRequested {
            user: user_state.user,
            percent,
            shares: shares_to_unstake,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Finalizes an unstake operation (called by API authority) and transfers SOL back to user
    /// @param ctx - The context of accounts
    /// @param tx_id - External transaction ID reference
    /// @param sol_amount - Amount of SOL returned to user
    /// @param token_amount - Amount of tokens returned to user
    pub fn finalize_unstake(
        ctx: Context<FinalizeUnstake>, 
        tx_id: String, 
        sol_amount: u64, 
        token_amount: u64
    ) -> Result<()> {
        // Ensure pool is not paused
        require!(!ctx.accounts.pool_state.paused, CustomError::PoolPaused);
        
        // Validate tx_id length
        require!(tx_id.len() <= 64, CustomError::InvalidTxId);
        
        // Validate amounts
        require!(sol_amount > 0 || token_amount > 0, CustomError::InvalidAmount);
        
        let user_state = &mut ctx.accounts.user_state;
        let pool_state = &mut ctx.accounts.pool_state;
        
        // Verify user is in unstake pending state
        require!(user_state.status == StakeStatus::UnstakePending, CustomError::InvalidState);

        // Calculate shares to remove
        let shares_to_remove = user_state.shares
            .checked_mul(user_state.pending_unstake_pct as u64)
            .ok_or(CustomError::MathOverflow)?
            .checked_div(100)
            .ok_or(CustomError::MathOverflow)?;
        
        // Verify user has enough shares
        require!(user_state.shares >= shares_to_remove, CustomError::InsufficientShares);

        // Ensure API wallet has enough SOL if sol_amount > 0
        if sol_amount > 0 {
            require!(
                ctx.accounts.api_wallet.lamports() >= sol_amount,
                CustomError::InsufficientFunds
            );
            
            // Transfer SOL from API wallet to user
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.api_wallet.to_account_info(),
                    to: ctx.accounts.user.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, sol_amount)?;
        }

        // Transfer tokens if needed (token_amount > 0)
        if token_amount > 0 {
            // Note: This would require additional accounts and logic to handle token transfers
            // This implementation focuses on the SOL transfer aspect
        }

        // Update user state
        user_state.shares = user_state.shares.checked_sub(shares_to_remove)
            .ok_or(CustomError::MathOverflow)?;
        user_state.status = StakeStatus::Completed;
        user_state.last_tx = tx_id.clone();
        user_state.last_update = Clock::get()?.unix_timestamp;
        
        // Update pool state
        pool_state.total_shares = pool_state.total_shares.checked_sub(shares_to_remove)
            .ok_or(CustomError::MathOverflow)?;

        // Emit unstake finalized event
        emit!(UnstakeFinalized {
            user: user_state.user,
            shares: shares_to_remove,
            sol_amount,
            token_amount,
            tx_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Claims SOL from the pool (owner only)
    /// @param ctx - The context of accounts
    /// @param amount - Amount of SOL to claim
    pub fn claim_sol(ctx: Context<ClaimSol>, amount: u64) -> Result<()> {
        // Verify owner is the signer - this is already checked in the ClaimSol struct
        
        // Validate amount
        require!(amount > 0, CustomError::InvalidAmount);
        
        // Check if pool has enough SOL
        let pool_lamports = ctx.accounts.pool_sol.lamports();
        require!(pool_lamports >= amount, CustomError::InsufficientFunds);

        // Transfer SOL
        **ctx.accounts.pool_sol.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;

        // Emit sol claimed event
        emit!(SolClaimed {
            owner: ctx.accounts.owner.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Claims tokens from the pool (owner only)
    /// @param ctx - The context of accounts
    /// @param amount - Amount of tokens to claim
    pub fn claim_tokens(ctx: Context<ClaimTokens>, amount: u64) -> Result<()> {
        // Verify owner is the signer - this is already checked in the ClaimTokens struct
        
        // Validate amount
        require!(amount > 0, CustomError::InvalidAmount);
        
        // Check if pool has enough tokens
        require!(ctx.accounts.pool_token.amount >= amount, CustomError::InsufficientFunds);

        // Create PDA signer seeds
        let pool_state_address = ctx.accounts.pool_state.key();
        let seeds = &[pool_state_address.as_ref(), &[ctx.bumps.pool_state]];
        let signer_seeds = &[&seeds[..]];

        // Transfer tokens
        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token.to_account_info(),
            to: ctx.accounts.owner_token.to_account_info(),
            authority: ctx.accounts.pool_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            cpi_accounts,
            signer_seeds
        );
        transfer(cpi_ctx, amount)?;

        // Emit tokens claimed event
        emit!(TokensClaimed {
            owner: ctx.accounts.owner.key(),
            amount,
            token_mint: ctx.accounts.pool_token.mint,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Transfers ownership of the pool to a new address (owner only)
    /// @param ctx - The context of accounts
    /// @param new_owner - New owner's public key
    pub fn transfer_ownership(ctx: Context<OnlyOwner>, new_owner: Pubkey) -> Result<()> {
        // Ensure new owner is not the zero address
        require!(new_owner != Pubkey::default(), CustomError::InvalidAddress);
        
        let old_owner = ctx.accounts.pool_state.owner;
        ctx.accounts.pool_state.owner = new_owner;

        // Emit ownership transferred event
        emit!(OwnershipTransferred {
            old_owner,
            new_owner,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Updates the API authority (owner only)
    /// @param ctx - The context of accounts
    /// @param new_api - New API authority's public key
    pub fn update_api_authority(ctx: Context<OnlyOwner>, new_api: Pubkey) -> Result<()> {
        // Ensure new API authority is not the zero address
        require!(new_api != Pubkey::default(), CustomError::InvalidAddress);
        
        let old_api = ctx.accounts.pool_state.api_authority;
        ctx.accounts.pool_state.api_authority = new_api;

        // Emit API authority updated event
        emit!(ApiAuthorityUpdated {
            old_api,
            new_api,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Sets the pause state of the pool (owner only)
    /// @param ctx - The context of accounts
    /// @param paused - Whether to pause or unpause the pool
    pub fn set_pause(ctx: Context<OnlyOwner>, paused: bool) -> Result<()> {
        ctx.accounts.pool_state.paused = paused;

        // Emit pause state changed event
        emit!(PauseStateChanged {
            paused,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Sets the fee percentage for the pool (owner only)
    /// @param ctx - The context of accounts
    /// @param percentage - Fee percentage (0-20)
    pub fn set_fee(ctx: Context<OnlyOwner>, percentage: u8) -> Result<()> {
        // Allow up to 20% fee (reasonable maximum)
        require!(percentage <= 20, CustomError::InvalidPercentage);
        
        let old_fee = ctx.accounts.pool_state.fee_percentage;
        ctx.accounts.pool_state.fee_percentage = percentage;

        // Emit fee updated event
        emit!(FeeUpdated {
            old_fee,
            new_fee: percentage,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Closes a user's account and returns the rent (user only)
    /// @param ctx - The context of accounts
    pub fn close_user_account(ctx: Context<CloseUserAccount>) -> Result<()> {
        let user_state = &ctx.accounts.user_state;
        
        // Verify user has no pending operations or shares
        require!(
            user_state.status == StakeStatus::Completed || 
            user_state.status == StakeStatus::New,
            CustomError::InvalidState
        );
        require!(user_state.shares == 0, CustomError::RemainingShares);

        // Emit account closed event
        emit!(UserAccountClosed {
            user: user_state.user,
            timestamp: Clock::get()?.unix_timestamp,
        });

        // Account will be closed and rent returned by the system
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = owner, 
        space = 8 + PoolState::SPACE
    )]
    pub pool_state: Account<'info, PoolState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// The API authority that will process stakes/unstakes
    pub api_authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitiateStake<'info> {
    #[account(mut, constraint = !pool_state.paused @ CustomError::PoolPaused)]
    pub pool_state: Account<'info, PoolState>,
    
    #[account(
        init_if_needed, 
        payer = user, 
        space = 8 + UserState::SPACE, 
        seeds = [b"user", user.key().as_ref()], 
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    /// User's wallet that will stake SOL
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// API wallet to receive the staked SOL
    #[account(mut)]
    pub api_wallet: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessStake<'info> {
    #[account(mut, constraint = !pool_state.paused @ CustomError::PoolPaused)]
    pub pool_state: Account<'info, PoolState>,
    
    #[account(
        mut, 
        seeds = [b"user", user_state.user.as_ref()], 
        bump,
        constraint = user_state.status == StakeStatus::Pending @ CustomError::InvalidState
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        constraint = pool_state.api_authority == api_authority.key() @ CustomError::Unauthorized
    )]
    pub api_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RequestUnstake<'info> {
    #[account(constraint = !pool_state.paused @ CustomError::PoolPaused)]
    pub pool_state: Account<'info, PoolState>,
    
    #[account(
        mut, 
        seeds = [b"user", user.key().as_ref()], 
        bump,
        constraint = user_state.user == user.key() @ CustomError::Unauthorized,
        constraint = user_state.status == StakeStatus::Completed @ CustomError::InvalidState
    )]
    pub user_state: Account<'info, UserState>,
    
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeUnstake<'info> {
    #[account(mut, constraint = !pool_state.paused @ CustomError::PoolPaused)]
    pub pool_state: Account<'info, PoolState>,
    
    #[account(
        mut, 
        seeds = [b"user", user_state.user.as_ref()], 
        bump,
        constraint = user_state.status == StakeStatus::UnstakePending @ CustomError::InvalidState
    )]
    pub user_state: Account<'info, UserState>,
    
    /// The wallet of the user to receive unstaked SOL
    #[account(mut)]
    pub user: AccountInfo<'info>,
    
    /// API wallet that will send SOL back to user
    #[account(
        mut,
        constraint = api_authority.key() == pool_state.api_authority @ CustomError::Unauthorized
    )]
    pub api_wallet: AccountInfo<'info>,
    
    pub api_authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimSol<'info> {
    #[account(mut, has_one = owner @ CustomError::Unauthorized)]
    pub pool_state: Account<'info, PoolState>,
    
    /// The account holding SOL to be claimed
    #[account(mut)]
    pub pool_sol: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(
        mut, 
        has_one = owner @ CustomError::Unauthorized,
        seeds = [b"pool_state"], 
        bump
    )]
    pub pool_state: Account<'info, PoolState>,
    
    /// The token account owned by the pool
    #[account(mut)]
    pub pool_token: Account<'info, TokenAccount>,
    
    /// The token account owned by the owner to receive tokens
    #[account(mut)]
    pub owner_token: Account<'info, TokenAccount>,
    
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OnlyOwner<'info> {
    #[account(mut, has_one = owner @ CustomError::Unauthorized)]
    pub pool_state: Account<'info, PoolState>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseUserAccount<'info> {
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()], 
        bump,
        constraint = user_state.user == user.key() @ CustomError::Unauthorized,
        constraint = user_state.shares == 0 @ CustomError::RemainingShares,
        close = user
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct PoolState {
    pub owner: Pubkey,          // 32 bytes
    pub api_authority: Pubkey,  // 32 bytes
    pub paused: bool,           // 1 byte
    pub total_shares: u64,      // 8 bytes
    pub fee_percentage: u8,     // 1 byte
    // Total: 74 bytes + padding
}

impl PoolState {
    pub const SPACE: usize = 32 + 32 + 1 + 8 + 1 + 8; // 82 bytes with padding
}

#[account]
pub struct UserState {
    pub user: Pubkey,               // 32 bytes
    pub shares: u64,                // 8 bytes
    pub total_deposited: u64,       // 8 bytes
    pub pending_stake: u64,         // 8 bytes
    pub pending_unstake_pct: u8,    // 1 byte
    pub status: StakeStatus,        // 1 byte (enum)
    pub last_tx: String,            // 4 + 64 max bytes (String)
    pub last_update: i64,           // 8 bytes (timestamp)
    // Total: ~134 bytes + padding
}

impl UserState {
    pub const SPACE: usize = 32 + 8 + 8 + 8 + 1 + 1 + (4 + 64) + 8 + 8; // 142 bytes with padding
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum StakeStatus {
    New,            // Initial state
    Pending,        // Stake pending
    Completed,      // No pending operation
    UnstakePending, // Unstake pending
}

impl Default for StakeStatus {
    fn default() -> Self {
        StakeStatus::New
    }
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized action")]
    Unauthorized,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Invalid percentage")]
    InvalidPercentage,
    
    #[msg("Invalid state for this operation")]
    InvalidState,
    
    #[msg("Pool is currently paused")]
    PoolPaused,
    
    #[msg("Insufficient shares")]
    InsufficientShares,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Mathematics overflow")]
    MathOverflow,
    
    #[msg("Invalid address")]
    InvalidAddress,
    
    #[msg("Invalid transaction ID (too long)")]
    InvalidTxId,
    
    #[msg("Cannot close account with remaining shares")]
    RemainingShares,
}

// Events for tracking program actions
#[event]
pub struct PoolInitialized {
    pub pool: Pubkey,
    pub owner: Pubkey,
    pub api_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct StakeInitiated {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct StakeProcessed {
    pub user: Pubkey,
    pub amount: u64,
    pub shares: u64,
    pub tx_id: String,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeRequested {
    pub user: Pubkey,
    pub percent: u8,
    pub shares: u64,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeFinalized {
    pub user: Pubkey,
    pub shares: u64,
    pub sol_amount: u64,
    pub token_amount: u64,
    pub tx_id: String,
    pub timestamp: i64,
}

#[event]
pub struct SolClaimed {
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensClaimed {
    pub owner: Pubkey,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OwnershipTransferred {
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ApiAuthorityUpdated {
    pub old_api: Pubkey,
    pub new_api: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PauseStateChanged {
    pub paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct FeeUpdated {
    pub old_fee: u8,
    pub new_fee: u8,
    pub timestamp: i64,
}

#[event]
pub struct UserAccountClosed {
    pub user: Pubkey,
    pub timestamp: i64,
}