use anchor_lang::prelude::*;

use crate::entities::*;
use crate::errors::SolsplitErrors;

pub fn request_settling(ctx: Context<RequestSettlingContext>)-> Result<()> {

    let group = &mut ctx.accounts.group;

    let member_index = group.find_member(ctx.accounts.user.key());
    require!(member_index != MEMBER_NOT_FOUND, SolsplitErrors::NotAMember);

    require!(!group.locked_for_settling, SolsplitErrors::GroupIsLocked);

    group.locked_for_settling = true;
    
    let mut total_expense: u64 = 0;
    for exp in group.expense_per_user {
        total_expense = total_expense.checked_add(exp).ok_or(SolsplitErrors::ArithmeticError)?;
    }
    group.settling_request = total_expense / (group.members_count as u64) + if(total_expense % (group.members_count as u64)) > 0 {1} else {0};

    Ok(())
}

#[derive(Accounts)]
pub struct RequestSettlingContext<'info>{
    #[account()]    
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

    //pub system_program: Program<'info, System>,
}