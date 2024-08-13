use anchor_lang::prelude::*;

use crate::entities::*;
use crate::errors::SolsplitErrors;

pub fn join_group(ctx: Context<JoinGroupContext>) -> Result<()> {
    let group = &mut ctx.accounts.group;
    require!(!group.locked_for_settling, SolsplitErrors::GroupIsLocked);
    require!(group.members_count < GROUP_MAX_MEMBERS as u8, SolsplitErrors::MaxGroupSizeReached);

    let member_index =  group.find_member(ctx.accounts.user.key());
    require!(member_index == MEMBER_NOT_FOUND, SolsplitErrors::UserHasAlreadyJoined);
    
    let current_group_size = group.members_count as usize;
    group.members[current_group_size] = ctx.accounts.user.key();
    group.members_count += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct JoinGroupContext<'info> {
    #[account( )]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [      
            group.name[..group.group_name_length as usize].as_ref(),
            GROUP_SEED.as_bytes(),
            group.admin.key().as_ref(),
        ],     
        bump = group.bump
    )]
    pub group: Account<'info, Group>,
}