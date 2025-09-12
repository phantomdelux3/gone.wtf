use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_lang::system_program;

declare_id!("9rmZUMPc3pc3pwBk3M8CBjGkCnyCLhfTjk5VrhaouTgj");

#[program]
pub mod gone_token_sale {
    use super::*;

    // Initialize the token sale
    pub fn initialize_sale(
        ctx: Context<InitializeSale>,
        rate: u64,
        min_purchase: u64,
        max_purchase: u64,
    ) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        sale.admin = ctx.accounts.admin.key();
        sale.token_mint = ctx.accounts.token_mint.key();
        sale.rate = rate; // GONE tokens per SOL (e.g., 1_000_000_000 for 1 SOL = 1B GONE)
        sale.min_purchase = min_purchase;
        sale.max_purchase = max_purchase;
        sale.tokens_remaining = ctx.accounts.vault.amount;
        sale.is_active = true;
        sale.total_sol_raised = 0;
        sale.total_tokens_sold = 0;
        sale.buyer_count = 0;
        sale.whitelist_count = 0;
        
        msg!("Token sale initialized with rate: {}", rate);
        Ok(())
    }

    // Buy tokens with SOL
    pub fn buy_tokens(ctx: Context<BuyTokens>, sol_amount: u64) -> Result<()> {
        require!(ctx.accounts.sale.is_active, SaleError::SaleInactive);
        require!(sol_amount >= ctx.accounts.sale.min_purchase, SaleError::BelowMinPurchase);
        require!(sol_amount <= ctx.accounts.sale.max_purchase, SaleError::AboveMaxPurchase);

        // Enforce whitelist only if there are entries
        if ctx.accounts.sale.whitelist_count > 0 {
            require!(ctx.accounts.whitelist_entry.is_some(), SaleError::WhitelistRequired);
        }

        // Calculate token amount
        let token_amount = sol_amount
            .checked_mul(ctx.accounts.sale.rate)
            .ok_or(SaleError::Overflow)?;

        require!(token_amount <= ctx.accounts.vault.amount, SaleError::InsufficientTokens);

        // Transfer SOL to admin treasury via system program CPI
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.admin_treasury.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_program::transfer(cpi_ctx, sol_amount)?;

        // Transfer tokens to buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[u8]] = &[b"vault-authority", &[bump]];
        token::transfer(cpi_ctx.with_signer(&[signer_seeds]), token_amount)?;

        // Update sale state to reflect current vault amount after transfer
        ctx.accounts.sale.tokens_remaining = ctx.accounts.vault.amount;

        // Update sale metrics
        ctx.accounts.sale.total_sol_raised = ctx
            .accounts
            .sale
            .total_sol_raised
            .checked_add(sol_amount)
            .ok_or(SaleError::Overflow)?;
        ctx.accounts.sale.total_tokens_sold = ctx
            .accounts
            .sale
            .total_tokens_sold
            .checked_add(token_amount)
            .ok_or(SaleError::Overflow)?;

        if let Some(entry) = &mut ctx.accounts.whitelist_entry {
            if !entry.has_bought {
                ctx.accounts.sale.buyer_count = ctx
                    .accounts
                    .sale
                    .buyer_count
                    .checked_add(1)
                    .ok_or(SaleError::Overflow)?;
                entry.has_bought = true;
            }
        }

        msg!("Sold {} GONE for {} SOL", token_amount, sol_amount);
        Ok(())
    }

    // Admin function to update sale parameters
    pub fn update_sale(
        ctx: Context<UpdateSale>,
        rate: Option<u64>,
        min_purchase: Option<u64>,
        max_purchase: Option<u64>,
        is_active: Option<bool>,
    ) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);
        
        if let Some(rate) = rate {
            ctx.accounts.sale.rate = rate;
        }
        if let Some(min_purchase) = min_purchase {
            ctx.accounts.sale.min_purchase = min_purchase;
        }
        if let Some(max_purchase) = max_purchase {
            ctx.accounts.sale.max_purchase = max_purchase;
        }
        if let Some(is_active) = is_active {
            ctx.accounts.sale.is_active = is_active;
        }

        msg!("Sale parameters updated");
        Ok(())
    }

    // Admin function to withdraw remaining tokens
    pub fn withdraw_remaining(ctx: Context<WithdrawRemaining>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);
        
        let remaining = ctx.accounts.vault.amount;
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.admin_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[u8]] = &[b"vault-authority", &[bump]];
        token::transfer(cpi_ctx.with_signer(&[signer_seeds]), remaining)?;

        msg!("Withdrawn {} remaining GONE tokens", remaining);
        Ok(())
    }

    // Admin: add a buyer to the whitelist
    pub fn add_to_whitelist(ctx: Context<AddToWhitelist>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);

        let entry = &mut ctx.accounts.whitelist_entry;
        entry.sale = ctx.accounts.sale.key();
        entry.buyer = ctx.accounts.buyer.key();
        entry.has_bought = false;

        // Track whitelist size
        ctx.accounts.sale.whitelist_count = ctx
            .accounts
            .sale
            .whitelist_count
            .checked_add(1)
            .ok_or(SaleError::Overflow)?;

        msg!("Added {} to whitelist for sale {}", entry.buyer, entry.sale);
        Ok(())
    }

    // Admin: remove a buyer from the whitelist (closes account to admin)
    pub fn remove_from_whitelist(ctx: Context<RemoveFromWhitelist>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.sale.admin, SaleError::Unauthorized);
        // Track whitelist size
        ctx.accounts.sale.whitelist_count = ctx
            .accounts
            .sale
            .whitelist_count
            .checked_sub(1)
            .ok_or(SaleError::Overflow)?;
        msg!(
            "Removed {} from whitelist for sale {}",
            ctx.accounts.buyer.key(),
            ctx.accounts.sale.key()
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSale<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + 8 + 8,
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
    
    /// CHECK: This is the PDA that will authority the vault
    #[account(seeds = [b"vault-authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
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
    
    /// CHECK: This is the PDA that authority the vault
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

    pub whitelist_entry: Option<Account<'info, WhitelistEntry>>,
    
    #[account(mut, address = sale.admin)]
    pub admin_treasury: SystemAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSale<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawRemaining<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault", sale.key().as_ref()],
        bump,
        constraint = vault.mint == sale.token_mint,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    /// CHECK: This is the PDA that authority the vault
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
pub struct AddToWhitelist<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub sale: Account<'info, Sale>,

    /// CHECK: buyer to whitelist
    pub buyer: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 1,
        seeds = [b"whitelist", sale.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveFromWhitelist<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub sale: Account<'info, Sale>,

    /// CHECK: buyer to remove
    pub buyer: UncheckedAccount<'info>,

    #[account(
        mut,
        close = admin,
        seeds = [b"whitelist", sale.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,
}

#[account]
pub struct Sale {
    pub admin: Pubkey,           // Admin wallet address
    pub token_mint: Pubkey,      // $GONE mint address
    pub rate: u64,               // GONE tokens per SOL (1 SOL = rate GONE)
    pub min_purchase: u64,       // Minimum SOL purchase amount
    pub max_purchase: u64,       // Maximum SOL purchase amount
    pub tokens_remaining: u64,   // Remaining tokens in sale
    pub is_active: bool,         // Sale status
    pub total_sol_raised: u64,   // Total SOL raised
    pub total_tokens_sold: u64,  // Total tokens sold
    pub buyer_count: u64,        // Unique buyers who purchased
    pub whitelist_count: u64,    // Number of whitelist entries
}

#[account]
pub struct WhitelistEntry {
    pub sale: Pubkey,
    pub buyer: Pubkey,
    pub has_bought: bool,
}

#[error_code]
pub enum SaleError {
    #[msg("Sale is not active")]
    SaleInactive,
    #[msg("Purchase amount below minimum")]
    BelowMinPurchase,
    #[msg("Purchase amount above maximum")]
    AboveMaxPurchase,
    #[msg("Insufficient tokens remaining")]
    InsufficientTokens,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Whitelist entry required for purchase")] 
    WhitelistRequired,
}