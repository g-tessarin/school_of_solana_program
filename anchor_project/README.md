SolSplit program

SolSplit is an utility program that allows to manage the expenses within a group of people by allowing to track all the expenses sustained by its members for a certain activity (e.g. a vacation) and then settle the debts within the group so that the total amount spent recorded in the group is split in equal parts between the members

- To use SolSplit a user must first create a Group by calling the create_group() function, the Group is the PDA demanded to track the memberships of the users and the sum of all the expenses sustained by each user. The user that creates the group will be its administrator, and the Group itself is a PDA derived from a name decided by the admin and the admin's public key

- Everybody that knows the admin's public key and the group name can join the group with the join_group() function

- Once a user is member of a group they can start to register the expenses with the add_expenses() function, although the sum of all the expenses is kept within the Group PDA, every expense is a PDA on its own, derived by the Group's key

- Once all the expenses are registered any member can request to settle the debts within the group with the request_settling() function. Once a settling is requested the group is locked and no expenses can be added, nor users can join until the settling is completed. This function computes the amount that each member is expected to have paid at the end of the settling as settling_request = Ceil(sum(all expenses from all the members from the group creation or from the last settling))

- To complete the settling every user is required to call the authorize_settling() function:
    - users that have registered a total amount of expenses inferior to the settling_request are required to call this function before, since they are required to deposit in the Group account an amount equal to the difference between the settling_request and total amount of their expenses.
    - users that have registered a total amount of expenses greater thanthe settling_request will whitdraw the ifference between the settling_request and total amount of their expenses from the Group account
    - users that have registered a total amount of expenses equal to the settling_request are still required to call the authorize_settling() function in order to complete the settling but no transaction with the Group account will take place

- once the settling is completed the group will unlock to allow the addition of other expenses and the access to other members

Given the way the settling_request is computed if the total amount of the expenses sustained within a group cannot be divided by its members at the end of the settling the group account will contain (Total expense) % (number of members) lamports that will be not split between the users. The admin can retrieve these lamports together with the balance of the group account by closing the group with the delete_group() function.

Technical info:
anchor version: 0.29.0
solana: 1.18.11
rustc: 1.78.0