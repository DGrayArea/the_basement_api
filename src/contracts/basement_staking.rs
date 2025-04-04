use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Stake11111111111111111111111111111111111111");

#[program]
mod staking_router {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, staking_wallet: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.owner = ctx.accounts.owner.key();
        state.staking_wallet = staking_wallet;
        state.total_shares = 0;
        state.total_claimed_rewards = 0;
        state.bump = *ctx.bumps.get("state").unwrap();
        Ok(())
    }

    pub fn update_staking_wallet(ctx: Context<UpdateStakingWallet>, new_wallet: Pubkey) -> Result<()> {
        require!(ctx.accounts.owner.key() == ctx.accounts.state.owner, StakingError::Unauthorized);
        ctx.accounts.state.staking_wallet = new_wallet;
        Ok(())
    }

    pub fn get_user_data(ctx: Context<GetUserData>) -> Result<UserAccountData> {
        let user_account = &ctx.accounts.user_account;
        
        Ok(UserAccountData {
            shares: user_account.shares,
            last_claimed_rewards: user_account.last_claimed_rewards,
            withdrawal_pending: user_account.withdrawal_pending,
            claim_pending: user_account.claim_pending,
            pending_withdrawal_shares: user_account.pending_withdrawal_shares,
        })
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let state = &mut ctx.accounts.state;
        let user_account = &mut ctx.accounts.user_account;
        
        let ix = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.staking_wallet.key(),
            amount
        );
        
        invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.staking_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        let total_staked = ctx.accounts.staking_wallet.lamports();
        let shares_issued = if state.total_shares > 0 && total_staked > amount {
            let numerator = amount as u128 * state.total_shares as u128;
            let denominator = (total_staked - amount) as u128;
            ((numerator + denominator - 1) / denominator) as u64
        } else {
            amount
        };
        
        user_account.shares += shares_issued;
        user_account.last_claimed_rewards = state.total_claimed_rewards;
        state.total_shares += shares_issued;
        
        emit!(DepositEvent {
            user: ctx.accounts.user.key(),
            amount,
            shares: shares_issued,
            total_shares: state.total_shares,
        });
        
        Ok(())
    }

    pub fn request_withdraw(ctx: Context<RequestWithdraw>, shares_to_withdraw: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        
        require!(shares_to_withdraw > 0, StakingError::InvalidAmount);
        require!(user_account.shares >= shares_to_withdraw, StakingError::InsufficientShares);
        require!(!user_account.withdrawal_pending, StakingError::WithdrawalAlreadyPending);
        
        user_account.withdrawal_pending = true;
        user_account.pending_withdrawal_shares = shares_to_withdraw;
        user_account.withdrawal_request_timestamp = Clock::get()?.unix_timestamp;
        
        emit!(WithdrawRequestEvent {
            user: ctx.accounts.user.key(),
            shares: shares_to_withdraw,
            timestamp: user_account.withdrawal_request_timestamp,
        });
        
        Ok(())
    }

    pub fn process_withdraw(ctx: Context<ProcessWithdraw>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let user_account = &mut ctx.accounts.user_account;
        
        require!(
            ctx.accounts.staking_authority.key() == state.staking_wallet,
            StakingError::Unauthorized
        );
        
        require!(user_account.withdrawal_pending, StakingError::NoWithdrawalRequest);
        require!(user_account.pending_withdrawal_shares > 0, StakingError::InvalidAmount);
        require!(user_account.pending_withdrawal_shares <= user_account.shares, StakingError::InsufficientShares);
        
        let current_time = Clock::get()?.unix_timestamp;
        let elapsed_time = current_time - user_account.withdrawal_request_timestamp;
        require!(elapsed_time >= 0, StakingError::InvalidTimestamp);
        
        let total_staked = ctx.accounts.staking_authority.lamports();
        let shares_to_withdraw = user_account.pending_withdrawal_shares;
        
        require!(state.total_shares > 0, StakingError::NoShares);
        
        let numerator = total_staked as u128 * shares_to_withdraw as u128;
        let denominator = state.total_shares as u128;
        let withdraw_amount = ((numerator + denominator - 1) / denominator) as u64;
        
        require!(withdraw_amount > 0, StakingError::InvalidAmount);
        require!(withdraw_amount <= ctx.accounts.staking_authority.lamports(), StakingError::InsufficientFunds);
        
        user_account.shares -= shares_to_withdraw;
        state.total_shares -= shares_to_withdraw;
        user_account.withdrawal_pending = false;
        user_account.pending_withdrawal_shares = 0;
        user_account.withdrawal_request_timestamp = 0;
        
        let ix = system_instruction::transfer(
            &ctx.accounts.staking_authority.key(),
            &ctx.accounts.user.key(),
            withdraw_amount
        );
        
        invoke(
            &ix,
            &[
                ctx.accounts.staking_authority.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        emit!(WithdrawProcessedEvent {
            user: ctx.accounts.user.key(),
            amount: withdraw_amount,
            shares: shares_to_withdraw,
        });
        
        Ok(())
    }

    pub fn request_claim(ctx: Context<RequestClaim>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let state = &ctx.accounts.state;
        
        require!(user_account.shares > 0, StakingError::NoShares);
        require!(!user_account.claim_pending, StakingError::ClaimAlreadyPending);
        
        require!(
            state.total_claimed_rewards > user_account.last_claimed_rewards,
            StakingError::NoNewRewards
        );
        
        user_account.claim_pending = true;
        user_account.claim_request_timestamp = Clock::get()?.unix_timestamp;
        
        emit!(ClaimRequestEvent {
            user: ctx.accounts.user.key(),
            shares: user_account.shares,
            timestamp: user_account.claim_request_timestamp,
        });
        
        Ok(())
    }

    pub fn add_rewards(ctx: Context<AddRewards>, amount: u64) -> Result<()> {
        require!(ctx.accounts.staking_authority.key() == ctx.accounts.state.staking_wallet, StakingError::Unauthorized);
        require!(amount > 0, StakingError::InvalidAmount);
        
        let state = &mut ctx.accounts.state;
        state.total_claimed_rewards += amount;
        
        emit!(AddRewardsEvent {
            amount,
            total_rewards: state.total_claimed_rewards,
        });
        
        Ok(())
    }

    pub fn process_claim(ctx: Context<ProcessClaim>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let user_account = &mut ctx.accounts.user_account;
        
        require!(
            ctx.accounts.staking_authority.key() == state.staking_wallet,
            StakingError::Unauthorized
        );
        
        require!(user_account.claim_pending, StakingError::NoClaimRequest);
        
        let current_time = Clock::get()?.unix_timestamp;
        let elapsed_time = current_time - user_account.claim_request_timestamp;
        require!(elapsed_time >= 0, StakingError::InvalidTimestamp);
        
        require!(state.total_shares > 0, StakingError::NoShares);
        
        let user_share_ratio = user_account.shares as u128 * 1_000_000 / state.total_shares as u128;
        let new_rewards = state.total_claimed_rewards - user_account.last_claimed_rewards;
        
        let numerator = new_rewards as u128 * user_share_ratio;
        let denominator = 1_000_000;
        let rewards_amount = ((numerator + denominator - 1) / denominator) as u64;
        
        require!(rewards_amount > 0, StakingError::InsufficientRewards);
        require!(rewards_amount <= ctx.accounts.staking_authority.lamports(), StakingError::InsufficientFunds);
        
        user_account.last_claimed_rewards = state.total_claimed_rewards;
        user_account.claim_pending = false;
        user_account.claim_request_timestamp = 0;
        
        let ix = system_instruction::transfer(
            &ctx.accounts.staking_authority.key(),
            &ctx.accounts.user.key(),
            rewards_amount
        );
        
        invoke(
            &ix,
            &[
                ctx.accounts.staking_authority.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        emit!(ClaimProcessedEvent {
            user: ctx.accounts.user.key(),
            amount: rewards_amount,
        });
        
        Ok(())
    }

    pub fn rescue_sol(ctx: Context<RescueSol>, amount: u64) -> Result<()> {
        require!(ctx.accounts.owner.key() == ctx.accounts.state.owner, StakingError::Unauthorized);
        require!(amount > 0, StakingError::InvalidAmount);
        
        let current_balance = ctx.accounts.state.to_account_info().lamports();
        require!(current_balance >= amount, StakingError::InsufficientFunds);
        
        **ctx.accounts.state.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;
        
        emit!(RescueSolEvent {
            amount,
        });
        
        Ok(())
    }
    
    pub fn rescue_token(ctx: Context<RescueToken>, amount: u64) -> Result<()> {
        require!(ctx.accounts.owner.key() == ctx.accounts.state.owner, StakingError::Unauthorized);
        require!(amount > 0, StakingError::InvalidAmount);
        
        let token_balance = ctx.accounts.token_account.amount;
        require!(token_balance >= amount, StakingError::InsufficientFunds);
        
        let seeds = &[
            b"staking_state".as_ref(),
            &[ctx.accounts.state.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.state.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, amount)?;
        
        emit!(RescueTokenEvent {
            token_mint: ctx.accounts.token_mint.key(),
            amount,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = owner, 
        space = 8 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"staking_state"],
        bump
    )]
    pub state: Account<'info, StakingState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateStakingWallet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump,
        constraint = owner.key() == state.owner @ StakingError::Unauthorized
    )]
    pub state: Account<'info, StakingState>,
}

#[derive(Accounts)]
pub struct GetUserData<'info> {
    pub user: AccountInfo<'info>,
    
    #[account(
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 8 + 8 + 1 + 1 + 8 + 8 + 8,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub staking_wallet: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(shares_to_withdraw: u64)]
pub struct RequestWithdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
}

#[derive(Accounts)]
pub struct ProcessWithdraw<'info> {
    #[account(mut)]
    pub staking_authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub user: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestClaim<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
}

#[derive(Accounts)]
pub struct AddRewards<'info> {
    #[account(mut)]
    pub staking_authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump,
        constraint = staking_authority.key() == state.staking_wallet @ StakingError::Unauthorized
    )]
    pub state: Account<'info, StakingState>,
}

#[derive(Accounts)]
pub struct ProcessClaim<'info> {
    #[account(mut)]
    pub staking_authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub user: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct RescueSol<'info> {
    #[account(
        mut,
        constraint = owner.key() == state.owner @ StakingError::Unauthorized
    )]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct RescueToken<'info> {
    #[account(
        mut,
        constraint = owner.key() == state.owner @ StakingError::Unauthorized
    )]
    pub owner: Signer<'info>,
    
    #[account(
        seeds = [b"staking_state"],
        bump = state.bump
    )]
    pub state: Account<'info, StakingState>,
    
    /// CHECK: This is the mint of the token being rescued
    pub token_mint: AccountInfo<'info>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = state
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = owner
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingState {
    pub owner: Pubkey,
    pub staking_wallet: Pubkey,
    pub total_shares: u64,
    pub total_claimed_rewards: u64,
    pub bump: u8,
}

#[account]
pub struct UserAccount {
    pub shares: u64,
    pub last_claimed_rewards: u64,
    pub withdrawal_pending: bool,
    pub claim_pending: bool,
    pub pending_withdrawal_shares: u64,
    pub withdrawal_request_timestamp: i64,
    pub claim_request_timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct UserAccountData {
    pub shares: u64,
    pub last_claimed_rewards: u64,
    pub withdrawal_pending: bool,
    pub claim_pending: bool,
    pub pending_withdrawal_shares: u64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub shares: u64,
    pub total_shares: u64,
}

#[event]
pub struct WithdrawRequestEvent {
    pub user: Pubkey,
    pub shares: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawProcessedEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub shares: u64,
}

#[event]
pub struct ClaimRequestEvent {
    pub user: Pubkey,
    pub shares: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimProcessedEvent {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct AddRewardsEvent {
    pub amount: u64,
    pub total_rewards: u64,
}

#[event]
pub struct RescueSolEvent {
    pub amount: u64,
}

#[event]
pub struct RescueTokenEvent {
    pub token_mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum StakingError {
    #[msg("Unauthorized action")]
    Unauthorized,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("No shares available")]
    NoShares,
    
    #[msg("Insufficient shares")]
    InsufficientShares,
    
    #[msg("No withdrawal request pending")]
    NoWithdrawalRequest,
    
    #[msg("No claim request pending")]
    NoClaimRequest,
    
    #[msg("Withdrawal already pending")]
    WithdrawalAlreadyPending,
    
    #[msg("Claim already pending")]
    ClaimAlreadyPending,
    
    #[msg("No new rewards available")]
    NoNewRewards,
    
    #[msg("Insufficient rewards")]
    InsufficientRewards,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
}