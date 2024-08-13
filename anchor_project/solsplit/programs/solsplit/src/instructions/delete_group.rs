use anchor_lang::prelude::*;

use crate::entities::*;
use crate::errors::SolsplitErrors;

pub fn delete_group(ctx: Context<DeleteGroupContext>) -> Result<()> {
    let group = &mut ctx.accounts.group;
    require!(!group.locked_for_settling, SolsplitErrors::GroupIsLocked);

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteGroupContext<'info> {
    #[account(mut)]
    pub group_admin: Signer<'info>,

    #[account(
        mut,
        close = group_admin,        
        seeds = [
            group.name[..group.group_name_length as usize].as_ref(),
            GROUP_SEED.as_bytes(),
            group_admin.key().as_ref(),
        ],
        bump = group.bump
    )]
    pub group: Account<'info, Group>,
}
