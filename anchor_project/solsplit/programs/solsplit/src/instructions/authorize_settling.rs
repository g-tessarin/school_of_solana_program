use anchor_lang::prelude::*;

use crate::entities::*;
use crate::errors::SolsplitErrors;

pub fn authorize_settling(ctx: Context<AuthorizeSettlingContext>) -> Result<()>{
    let group = &mut ctx.accounts.group;
    
    let member_index = group.find_member(ctx.accounts.user_authority.key());
    require!(member_index != MEMBER_NOT_FOUND, SolsplitErrors::NotAMember);

    require!(group.locked_for_settling, SolsplitErrors::NoSettlingRequest);
    
    let expense_for_current_user : u64 = group.expense_per_user[member_index];
      
    if expense_for_current_user < group.settling_request{
        //user must deposit       
        let transaction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user_authority.key(),//src
            &group.key(),//dest
            group.settling_request - expense_for_current_user,
        );

        anchor_lang::solana_program::program::invoke(
            &transaction,
            &[
                ctx.accounts.user_authority.to_account_info(),
                group.to_account_info(),
            ],            
        )?;
    } else if expense_for_current_user > group.settling_request {
        let user = &mut ctx.accounts.user_authority;
        let amount = expense_for_current_user - group.settling_request;
        //user must withdraw
        **group.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
   

      /* * let transaction = anchor_lang::solana_program::system_instruction::transfer(

            &group.key(),//src
            &ctx.accounts.user_authority.key(),//dest
            expense_for_current_user -  group.settling_request,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transaction,
            &[
                group.to_account_info(),
                ctx.accounts.user_authority.to_account_info(),
            ],
        )?;*/
    }
    // if expense_for_current_user == group.settling_request
    // the user has spent has much as he is expected, no further actions are needed
    group.register_user_as_settled(member_index);

    if group.is_settling_completed(){
        group.locked_for_settling = false;
        group.settling_request = 0;
        group.reset_settling_fields();
    }
    Ok(())
}

#[derive(Accounts)]
pub struct AuthorizeSettlingContext<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,

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

    pub system_program: Program<'info, System>,
}