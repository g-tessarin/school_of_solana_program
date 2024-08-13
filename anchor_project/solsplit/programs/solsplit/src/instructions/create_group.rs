use anchor_lang::prelude::*;

use crate::entities::*;

pub fn create_group(ctx: Context<CreateGroupContext>, group_name: String) -> Result<()>{
    let initialized_group = &mut ctx.accounts.group;
    
    let mut group_name_data = [0u8; GROUPNAME_LENGTH];
    group_name_data[..group_name.as_bytes().len()].copy_from_slice(group_name.as_bytes());
    
    initialized_group.name = group_name_data;
    initialized_group.group_name_length = group_name.as_bytes().len() as u8;

    initialized_group.admin = ctx.accounts.group_admin.key();
    initialized_group.members[0] = ctx.accounts.group_admin.key();
    initialized_group.members_count = 1;
    initialized_group.expenses_count = 0;
    initialized_group.bump = ctx.bumps.group;
    
    initialized_group.locked_for_settling = false;
    initialized_group.reset_settling_fields();

    Ok(())
}

#[derive(Accounts)]
#[instruction(group_name: String)]
pub struct CreateGroupContext<'info> {
    #[account(mut)]
    pub group_admin: Signer<'info>,

    #[account(
        init,
        payer = group_admin,
        space = 8 + Group::LEN,
        seeds = [
            group_name.as_bytes(),
            GROUP_SEED.as_bytes(),
            group_admin.key().as_ref(),            
        ],
        bump
    )]        
    pub group: Account<'info, Group>,
  
    pub system_program: Program<'info, System>,
}