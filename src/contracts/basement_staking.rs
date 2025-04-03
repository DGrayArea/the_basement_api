use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[program]
mod staking_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, staking_wallet: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.owner = ctx.accounts.owner.key();
        state.staking_wallet = staking_wallet;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let user_account = &mut ctx.accounts.user_account;
        let staking_wallet = state.staking_wallet;
        
        let total_pool_value = ctx.accounts.staking_wallet.amount;
        let shares_issued = if total_pool_value > 0 {
            (amount as u128 * user_account.shares as u128 / total_pool_value as u128) as u64
        } else {
            amount
        };
        
        user_account.shares += shares_issued;
        state.total_shares += shares_issued;
        
        token::transfer(ctx.accounts.into_transfer_context(), amount)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let user_account = &mut ctx.accounts.user_account;
        
        let user_share_ratio = user_account.shares as u128 * 1_000_000 / state.total_shares as u128;
        let withdraw_amount = (ctx.accounts.staking_wallet.amount as u128 * user_share_ratio / 1_000_000) as u64;
        
        state.total_shares -= user_account.shares;
        user_account.shares = 0;
        
        token::transfer(ctx.accounts.into_transfer_back_context(), withdraw_amount)?;
        Ok(())
    }

    pub fn rescue_funds(ctx: Context<RescueFunds>, amount: u64) -> Result<()> {
        require!(ctx.accounts.owner.key() == ctx.accounts.state.owner, CustomError::Unauthorized);
        token::transfer(ctx.accounts.into_transfer_rescue_context(), amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32)]
    pub state: Account<'info, StakingState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub staking_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub state: Account<'info, StakingState>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub staking_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub state: Account<'info, StakingState>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RescueFunds<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, StakingState>,
    #[account(mut)]
    pub rescue_wallet: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingState {
    pub owner: Pubkey,
    pub staking_wallet: Pubkey,
    pub total_shares: u64,
}

#[account]
pub struct UserAccount {
    pub shares: u64,
}

impl<'info> Deposit<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.staking_wallet.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> Withdraw<'info> {
    fn into_transfer_back_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.staking_wallet.to_account_info(),
            to: self.user.to_account_info(),
            authority: self.state.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> RescueFunds<'info> {
    fn into_transfer_rescue_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.staking_wallet.to_account_info(),
            to: self.rescue_wallet.to_account_info(),
            authority: self.state.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized action")] 
    Unauthorized,
}
