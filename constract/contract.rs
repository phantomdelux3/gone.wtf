use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_lang::system_program;

declare_id!("9rmZUMPc3pc3pwBk3M8CBjGkCnyCLhfTjk5VrhaouTgj");

#[program]
pub mod gone_token_sale {
    use super::*;

    /* ── 1. Initialise sale ─────────────────────────────────────── */
    pub fn initialize_sale(
        ctx: Context<InitializeSale>,
        rate: u64,
        min_purchase: u64,
        max_purchase: u64,
    ) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        sale.admin             = ctx.accounts.admin.key();
        sale.token_mint        = ctx.accounts.token_mint.key();
        sale.rate              = rate;
        sale.min_purchase      = min_purchase;
        sale.max_purchase      = max_purchase;
        sale.tokens_remaining  = ctx.accounts.vault.amount;
        sale.is_active         = true;
        sale.total_sol_raised  = 0;
        sale.total_tokens_sold = 0;
        sale.buyer_count       = 0;
        msg!("Token sale initialised");
        Ok(())
    }

    /* ── 2. Buy tokens ──────────────────────────────────────────── */
    pub fn buy_tokens(ctx: Context<BuyTokens>, sol_amount: u64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;

        require!(sale.is_active, SaleError::SaleInactive);
        require!(sol_amount >= sale.min_purchase, SaleError::BelowMinPurchase);
        require!(sol_amount <= sale.max_purchase, SaleError::AboveMaxPurchase);

        // Calculate GONE amount
        let token_amount = sol_amount.checked_mul(sale.rate).ok_or(SaleError::Overflow)?;
        require!(token_amount <= ctx.accounts.vault.amount, SaleError::InsufficientTokens);

        /* a) Transfer SOL → admin treasury */
        let cpi_sol = system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to:   ctx.accounts.admin_treasury.to_account_info(),
        };
        system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_sol),
            sol_amount,
        )?;

        /* b) Transfer GONE → buyer */
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[u8]] = &[b"vault-authority", &[bump]];

        let cpi_gone = Transfer {
            from:      ctx.accounts.vault.to_account_info(),
            to:        ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_gone)
                .with_signer(&[signer_seeds]),
            token_amount,
        )?;

        /* c) Book-keeping */
        sale.tokens_remaining   = ctx.accounts.vault.amount;
        sale.total_sol_raised   = sale.total_sol_raised.checked_add(sol_amount).ok_or(SaleError::Overflow)?;
        sale.total_tokens_sold  = sale.total_tokens_sold.checked_add(token_amount).ok_or(SaleError::Overflow)?;
        sale.buyer_count        = sale.buyer_count.checked_add(1).ok_or(SaleError::Overflow)?;

        msg!("Sold {} GONE for {} SOL", token_amount, sol_amount);
        Ok(())
    }

    /* ── 3. Admin: update parameters ────────────────────────────── */
    pub fn update_sale(
        ctx: Context<UpdateSale>,
        rate: Option<u64>,
        min_purchase: Option<u64>,
        max_purchase: Option<u64>,
        is_active: Option<bool>,
    ) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);

        if let Some(r)   = rate          { ctx.accounts.sale.rate          = r;   }
        if let Some(min) = min_purchase  { ctx.accounts.sale.min_purchase  = min; }
        if let Some(max) = max_purchase  { ctx.accounts.sale.max_purchase  = max; }
        if let Some(act) = is_active     { ctx.accounts.sale.is_active     = act; }
        Ok(())
    }

    /* ── 4. Admin: withdraw remaining tokens ────────────────────── */
    pub fn withdraw_remaining(ctx: Context<WithdrawRemaining>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);

        let remaining = ctx.accounts.vault.amount;
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[u8]] = &[b"vault-authority", &[bump]];

        let cpi = Transfer {
            from:      ctx.accounts.vault.to_account_info(),
            to:        ctx.accounts.admin_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi)
                .with_signer(&[signer_seeds]),
            remaining,
        )?;

        msg!("Withdrawn {} remaining GONE tokens", remaining);
        Ok(())
    }

    /* ── 5. Admin: sync tokens_remaining with vault balance ─────── */
    pub fn sync_tokens(ctx: Context<SyncTokens>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);
        ctx.accounts.sale.tokens_remaining = ctx.accounts.vault.amount;
        msg!("Synced tokens_remaining = {}", ctx.accounts.sale.tokens_remaining);
        Ok(())
    }
}

/* ─────────────────────────── Contexts ────────────────────────── */

#[derive(Accounts)]
pub struct InitializeSale<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8*8 + 1,
        seeds = [b"sale", admin.key().as_ref()],
        bump
    )]
    pub sale: Account<'info, Sale>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = token_mint,
        token::authority = vault_authority,
        seeds = [b"vault", sale.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: PDA authority
    #[account(seeds = [b"vault-authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program:  Program<'info, Token>,
    pub rent:           Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,

    #[account(
        mut,
        seeds = [b"vault", sale.key().as_ref()],
        bump,
        constraint = vault.mint == sale.token_mint,
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: PDA authority
    #[account(seeds = [b"vault-authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = buyer_token_account.mint == sale.token_mint,
        constraint = buyer_token_account.owner == buyer.key(),
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut, address = sale.admin)]
    pub admin_treasury: SystemAccount<'info>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSale<'info> {
    #[account(mut)]
    pub sale:  Account<'info, Sale>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawRemaining<'info> {
    #[account(mut)]
    pub sale:  Account<'info, Sale>,
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", sale.key().as_ref()],
        bump,
        constraint = vault.mint == sale.token_mint,
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: PDA authority
    #[account(seeds = [b"vault-authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = admin_token_account.mint == sale.token_mint,
        constraint = admin_token_account.owner == admin.key(),
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SyncTokens<'info> {
    #[account(mut)]
    pub sale:  Account<'info, Sale>,
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", sale.key().as_ref()],
        bump,
        constraint = vault.mint == sale.token_mint,
    )]
    pub vault: Account<'info, TokenAccount>,
}

/* ─────────────────────────── State & Errors ─────────────────── */

#[account]
pub struct Sale {
    pub admin:             Pubkey,
    pub token_mint:        Pubkey,
    pub rate:              u64,
    pub min_purchase:      u64,
    pub max_purchase:      u64,
    pub tokens_remaining:  u64,
    pub is_active:         bool,
    pub total_sol_raised:  u64,
    pub total_tokens_sold: u64,
    pub buyer_count:       u64,
}

#[error_code]
pub enum SaleError {
    #[msg("Sale is not active")]             SaleInactive,
    #[msg("Purchase amount below minimum")]  BelowMinPurchase,
    #[msg("Purchase amount above maximum")]  AboveMaxPurchase,
    #[msg("Insufficient tokens remaining")]  InsufficientTokens,
    #[msg("Unauthorized access")]            Unauthorized,
    #[msg("Arithmetic overflow")]            Overflow,
}
