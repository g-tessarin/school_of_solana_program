use anchor_lang::prelude::*;

pub const MEMBER_NOT_FOUND: usize = usize::MAX;

pub const GROUPNAME_LENGTH: usize = 32;
pub const EXPENSE_DESC_LENGTH: usize = 32;
pub const GROUP_MAX_MEMBERS: usize = 10;
pub const USER_SEED: &str = "USER_SEED";
pub const GROUP_SEED: &str = "GROUP_SEED";
pub const EXPENSE_SEED: &str = "EXPENSE_SEED";


#[account]
pub struct Expense {
    pub description: [u8; EXPENSE_DESC_LENGTH],   
    pub description_length: u8, 
    pub payer: Pubkey,
    pub lamports_amount: u64,
    pub lamports_per_sol: u64,
    pub bump: u8,
    pub index: [u8; 4]//todo find a way to use u32
} 
impl Expense {
    pub const LEN : usize = EXPENSE_DESC_LENGTH + 1 + 32 + 8 + 8 + 1 + 4;
}

#[account]
pub struct Group {
    pub admin: Pubkey,    
    pub name: [u8; GROUPNAME_LENGTH],
    pub group_name_length: u8,
    pub bump: u8,

    pub members: [Pubkey; GROUP_MAX_MEMBERS],   
    pub members_count: u8,
    pub expenses_count: u32,

    pub locked_for_settling: bool,
    pub expense_per_user: [u64; GROUP_MAX_MEMBERS],
    pub settled_users: [bool; GROUP_MAX_MEMBERS],
    pub settling_request: u64,
}
impl Group {
    pub const LEN: usize = 32 + 32 + GROUPNAME_LENGTH + 1 + 1 
    + 32 * GROUP_MAX_MEMBERS + 1 + 4 
    + 1 + 8 * GROUP_MAX_MEMBERS + GROUP_MAX_MEMBERS + 8;

    pub fn reset_settling_fields(&mut self){
        self.locked_for_settling = false;

        for i in 0..GROUP_MAX_MEMBERS {
            self.expense_per_user[i] =0;
            self.settled_users[i] = false;
        }
       
        self.settling_request = 0;
    }

    pub fn find_member(&mut self, element: Pubkey) -> usize{
        for i in 0..(self.members_count) as usize {
            if self.members[i] == element {
                return i;
            }
        }
        return MEMBER_NOT_FOUND;
    }

    pub fn register_user_as_settled(&mut self, member_index: usize){
        self.settled_users[member_index] = true;
    }

    pub fn is_ready_for_whitdraw(&self) -> bool{                
        for i in 0..(self.members_count) as usize {
            if (self.expense_per_user[i] < self.settling_request )&& !self.settled_users[i]{
                return false;
            }
        }
        return true;
    }

    pub fn is_settling_completed(&self ) -> bool{
        for i in 0..(self.members_count) as usize {
            if !self.settled_users[i]{
                return false;
            }
        }
        return true;
    }
}