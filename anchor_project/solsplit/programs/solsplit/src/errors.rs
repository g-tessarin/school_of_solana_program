use anchor_lang::prelude::*;

#[error_code]
pub enum SolsplitErrors {       
    #[msg("Maximum group size has been reached")]
    MaxGroupSizeReached,
    #[msg("User has already joined the group")]
    UserHasAlreadyJoined,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Wrong index")]
    WrongIndex,
    #[msg("The user is not a member")]
    NotAMember,
    #[msg("The group is locked by a settling request")]
    GroupIsLocked,
    #[msg("Arithmetic error in computing total expense")]
    ArithmeticError,
    #[msg("No settling has been requested")]
    NoSettlingRequest,
    #[msg("The user can't settle before the members who paid less than the average expense per user")]
    UserNotReadyForSettling,
}