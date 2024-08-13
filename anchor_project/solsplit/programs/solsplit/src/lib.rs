use anchor_lang::prelude::*;

use crate::instructions::*;

pub mod instructions;
pub mod entities;
pub mod errors;

declare_id!("9wjqD7c7AR8BttsmdKShzraGvC2zUqMbmmDLKTykxhi7");

#[program]
pub mod solsplit {
    use super::*;

    //create group
    pub fn create_group(ctx: Context<CreateGroupContext>, group_name: String) -> Result<()> {
        instructions::create_group(ctx, group_name)
    }
    //join group
    pub fn join_group(ctx: Context<JoinGroupContext>) -> Result<()> {
        instructions::join_group(ctx)
    }
    //add expense
    pub fn add_expense(ctx: Context<AddExpenseContext>, lamports_amount: u64, lamports_per_sol: u64, index: String, description: String)  -> Result<()> {
        instructions::add_expense(ctx, lamports_amount, lamports_per_sol, index, description)
    }

    //request settling
    pub fn request_settling(ctx: Context<RequestSettlingContext>) ->Result<()> {
        instructions::request_settling(ctx)
    }
    //authorize settling
   
    pub fn authorize_settling(ctx: Context<AuthorizeSettlingContext>) -> Result<()> {
        instructions::authorize_settling(ctx)
    }
   
    //delete group
    pub fn delete_group(ctx: Context<DeleteGroupContext>) -> Result<()> {
        instructions::delete_group(ctx)
    }
}
