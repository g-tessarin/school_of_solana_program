use anchor_lang::prelude::*;

use crate::entities::*;
use crate::errors::SolsplitErrors;

pub fn add_expense(ctx: Context<AddExpenseContext>, lamports_amount: u64, lamports_per_sol: u64, index: String, description: String)  -> Result<()> {
    let initialized_expense = &mut ctx.accounts.expense;
    let group = &mut ctx.accounts.group;

    let member_index = group.find_member(ctx.accounts.expense_authority.key());    
    require!(member_index != MEMBER_NOT_FOUND, SolsplitErrors::NotAMember);

    require!(!group.locked_for_settling, SolsplitErrors::GroupIsLocked);

    let integer_index :u32 = index.parse().unwrap();   
    require!(description.as_bytes().len() <= EXPENSE_DESC_LENGTH, SolsplitErrors::DescriptionTooLong);    

    require!(integer_index == group.expenses_count, SolsplitErrors::WrongIndex);
     

    let mut description_data = [0u8; EXPENSE_DESC_LENGTH];
    description_data[..description.as_bytes().len()].copy_from_slice(description.as_bytes());
    
    initialized_expense.description = description_data;
    initialized_expense.description_length = description.as_bytes().len() as u8;    
    initialized_expense.lamports_amount = lamports_amount;
    initialized_expense.lamports_per_sol = lamports_per_sol;
    
    let mut index_data = [0u8; 4];//todo find a way to use u32 instead of string
    index_data[..index.as_bytes().len()].copy_from_slice(index.as_bytes());
    initialized_expense.index = index_data;
    
    initialized_expense.payer = ctx.accounts.expense_authority.key();
    initialized_expense.bump = ctx.bumps.expense;

    group.expenses_count += 1;

    group.expense_per_user[member_index] += lamports_amount;
   
    Ok(())
}


#[derive(Accounts)]
#[instruction(lamports_amount: u64, lamports_per_sol: u64, index: String, description: String)]
pub struct AddExpenseContext<'info>{
    #[account(mut)]
    pub expense_authority: Signer<'info>,
   
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

    #[account(
        init,
        payer = expense_authority,
        space = 8 + Expense::LEN,
        seeds = [
            EXPENSE_SEED.as_bytes(),
            group.key().as_ref(),
            index[..index.as_bytes().len() as usize].as_ref(),          
        ],
        bump
    )]
    pub expense: Account<'info, Expense>,
    pub system_program: Program<'info, System>,
}