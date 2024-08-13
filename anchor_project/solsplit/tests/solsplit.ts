import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solsplit } from "../target/types/solsplit";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";


function getGroupAddress(groupName: string, admin: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(groupName),
      anchor.utils.bytes.utf8.encode("GROUP_SEED"),
      admin.toBuffer()
    ],
    programId,
  );
}

function getExpenseOnGroup(groupKey: PublicKey, index: number, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("EXPENSE_SEED"),
      groupKey.toBuffer(),
      anchor.utils.bytes.utf8.encode(index.toString()),
    ],
    programId,
  );
}

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

describe("solsplit", () => {
  const lamportsPerSol = 1000000000;
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace.Solsplit as Program<Solsplit>;

  const alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();
  const charlie = anchor.web3.Keypair.generate();
  const dan = anchor.web3.Keypair.generate();

  const group1Name = "group 1";
  let exp1 = 100;
  let exp2 = 57;
  describe("Group tests", async () => {
    it("Alice creates a group", async () => {
      await airdrop(provider.connection, alice.publicKey);
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      await program.methods.createGroup(group1Name).accounts({
        groupAdmin: alice.publicKey,
        group: group1AccountKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([alice]).rpc({ commitment: "confirmed" });

      const group1Account = await program.account.group.fetch(group1AccountKey);
      assert.equal(group1Account.admin.toBase58(), alice.publicKey.toBase58());
      assert.equal(group1Account.groupNameLength, group1Name.length);
      assert.equal(group1Account.membersCount, 1);
    });
    it("Bob joins the group", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      //init account
      await airdrop(provider.connection, bob.publicKey);

      //join alice's group
      await program.methods.joinGroup().accounts({
        group: group1AccountKey,
        user: bob.publicKey
      }).signers([bob]).rpc({ commitment: "confirmed" });

      //check results
      const group1Account = await program.account.group.fetch(group1AccountKey);
      assert.equal(group1Account.membersCount, 2);
      assert.equal(group1Account.members[1].toBase58(), bob.publicKey.toBase58());
    });
    it("he can't join twice", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      try {
        //join alice's group
        await program.methods.joinGroup().accounts({
          group: group1AccountKey,
          user: bob.publicKey
        }).signers([bob]).rpc({ commitment: "confirmed" });
      } catch (err) {
        assert.equal(err.error.errorMessage, "User has already joined the group");
      }
    });
  });
  describe("Expenses tests", async () => {

    it("alice tries to add  an expense with a long name", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const [expense1Key, expense1Bump] = getExpenseOnGroup(group1AccountKey, 0, program.programId);
      let bigDescricption = "foooooooooooooooooooooooooooooooood";
      try {
        await program.methods.addExpense(new anchor.BN(exp1), new anchor.BN(lamportsPerSol), "0", bigDescricption).accounts({
          expenseAuthority: alice.publicKey,
          group: group1AccountKey,
          expense: expense1Key
        }).signers([alice]).rpc({ commitment: "confirmed" });
      } catch (err) {
        assert.equal(err.error.errorMessage, "Description too long");
      }

    });
    it("alice tries to add  an expense with the wrong index", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const [expense1Key, expense1Bump] = getExpenseOnGroup(group1AccountKey, 5, program.programId);

      try {
        await program.methods.addExpense(new anchor.BN(exp1), new anchor.BN(lamportsPerSol), "5", "desc").accounts({
          expenseAuthority: alice.publicKey,
          group: group1AccountKey,
          expense: expense1Key
        }).signers([alice]).rpc({ commitment: "confirmed" });
      } catch (err) {
        assert.equal(err.error.errorMessage, "Wrong index");
      }
    });
    it("dan tries to add  an expense but he is not a member", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const [expense1Key, expense1Bump] = getExpenseOnGroup(group1AccountKey, 0, program.programId);
      //init account
      await airdrop(provider.connection, dan.publicKey);
      try {
        await program.methods.addExpense(new anchor.BN(exp1), new anchor.BN(lamportsPerSol), "0", "desc").accounts({
          expenseAuthority: dan.publicKey,
          group: group1AccountKey,
          expense: expense1Key
        }).signers([dan]).rpc({ commitment: "confirmed" });
      } catch (err) {
        assert.equal(err.error.errorMessage, "The user is not a member");
      }
    });

    it("alice adds an expense", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const [expense1Key, expense1Bump] = getExpenseOnGroup(group1AccountKey, 0, program.programId);

      await program.methods.addExpense(new anchor.BN(exp1), new anchor.BN(lamportsPerSol), "0", "food").accounts({
        expenseAuthority: alice.publicKey,
        group: group1AccountKey,
        expense: expense1Key
      }).signers([alice]).rpc({ commitment: "confirmed" });

      const expense1Account = await program.account.expense.fetch(expense1Key);

      assert.equal(expense1Account.lamportsAmount.toNumber(), exp1);
      assert.equal(expense1Account.payer.toBase58(), alice.publicKey.toBase58());
    });

    it("bob adds an expense", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      const group1Account = await program.account.group.fetch(group1AccountKey);
      let index = group1Account.expensesCount;
      console.log("index is " + index);
      const [expense2Key, expense2Bump] = getExpenseOnGroup(group1AccountKey, index, program.programId);
      await program.methods.addExpense(new anchor.BN(exp2), new anchor.BN(lamportsPerSol), index.toString(), "drinks").accounts({
        expenseAuthority: bob.publicKey,
        group: group1AccountKey,
        expense: expense2Key
      }).signers([bob]).rpc({ commitment: "confirmed", skipPreflight: true });

      const expense2Account = await program.account.expense.fetch(expense2Key);

      assert.equal(expense2Account.lamportsAmount.toNumber(), exp2);
      assert.equal(expense2Account.payer.toBase58(), bob.publicKey.toBase58());
    });
  });



  describe("settlig tests", async () => {
    it("dan tries to request the settling but he is not a member", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      try {
        await program.methods.requestSettling().accounts({
          user: dan.publicKey,
          group: group1AccountKey
        }).signers([dan]).rpc({ commitment: "confirmed" });
      } catch (err) {
        assert.equal(err.error.errorMessage, "The user is not a member");
      }
    });

    it("charlie enters the group and requests the settling", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      //init account
      await airdrop(provider.connection, charlie.publicKey);

      //charlie joinx alice's group
      await program.methods.joinGroup().accounts({
        group: group1AccountKey,
        user: charlie.publicKey
      }).signers([charlie]).rpc({ commitment: "confirmed" });

      await program.methods.requestSettling().accounts({
        user: charlie.publicKey,
        group: group1AccountKey
      }).signers([charlie]).rpc({ commitment: "confirmed" });
      //
      const group1Account = await program.account.group.fetch(group1AccountKey);
      assert.equal(group1Account.settlingRequest.toNumber(), Math.ceil((exp1 + exp2) / 3));
      console.log("group settling request: " + group1Account.settlingRequest);
    });

    it("alice can't add expenses if the group is locked", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const [expense1Key, expense1Bump] = getExpenseOnGroup(group1AccountKey, 3, program.programId);

      try {

        await program.methods.addExpense(new anchor.BN(exp1), new anchor.BN(lamportsPerSol), "3", "food").accounts({
          expenseAuthority: alice.publicKey,
          group: group1AccountKey,
          expense: expense1Key
        }).signers([alice]).rpc({ commitment: "confirmed" });
      } catch (error) {
        assert.equal(error.error.errorMessage, "The group is locked by a settling request");
      }
    });

    it("dan can't join if the group is locked", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      try {
        await program.methods.joinGroup().accounts({
          group: group1AccountKey,
          user: dan.publicKey
        }).signers([dan]).rpc({ commitment: "confirmed" });
      } catch (error) {
        assert.equal(error.error.errorMessage, "The group is locked by a settling request");
      }
    });


    it("three users authorize the settling", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);
      const group1Account = await program.account.group.fetch(group1AccountKey);

      let aliceBalanceT0 = await provider.connection.getBalance(alice.publicKey);
      let bobBalanceT0 = await provider.connection.getBalance(bob.publicKey);
      let charlieBalanceT0 = await provider.connection.getBalance(charlie.publicKey);
      let groupBalanceT0 = await provider.connection.getBalance(group1AccountKey);
      let settlingRequest = group1Account.settlingRequest;
      console.log("before");

      console.log("aliceBalance " + aliceBalanceT0);
      console.log("bobBalance   " + bobBalanceT0);
      console.log("charlie      " + charlieBalanceT0);
      console.log("group        " + groupBalanceT0);
      //charlie
      await program.methods.authorizeSettling().accounts({
        userAuthority: charlie.publicKey,
        // user: charlieAccountKey,
        group: group1AccountKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([charlie]).rpc({ commitment: "confirmed" });

      let aliceBalanceT1 = await provider.connection.getBalance(alice.publicKey);
      let bobBalanceT1 = await provider.connection.getBalance(bob.publicKey);
      let charlieBalanceT1 = await provider.connection.getBalance(charlie.publicKey);
      let groupBalanceT1 = await provider.connection.getBalance(group1AccountKey);
      console.log("after charlie settled");
      console.log("aliceBalance " + aliceBalanceT1);
      console.log("bobBalance   " + bobBalanceT1);
      console.log("charlie      " + charlieBalanceT1);
      console.log("group        " + groupBalanceT1);

      assert.equal(groupBalanceT1 - groupBalanceT0, settlingRequest.toNumber());
      assert.equal(charlieBalanceT0 - charlieBalanceT1, settlingRequest.toNumber());
      //bob
      await program.methods.authorizeSettling().accounts({
        userAuthority: bob.publicKey,
        group: group1AccountKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([bob]).rpc({ commitment: "confirmed" });

      let aliceBalanceT2 = await provider.connection.getBalance(alice.publicKey);
      let bobBalanceT2 = await provider.connection.getBalance(bob.publicKey);
      let charlieBalanceT2 = await provider.connection.getBalance(charlie.publicKey);
      let groupBalanceT2 = await provider.connection.getBalance(group1AccountKey);
      console.log("after bob settled");
      console.log("aliceBalance " + aliceBalanceT2);
      console.log("bobBalance   " + bobBalanceT2);
      console.log("charlie      " + charlieBalanceT2);
      console.log("group" + groupBalanceT2);

      await program.methods.authorizeSettling().accounts({
        userAuthority: alice.publicKey,
        group: group1AccountKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([alice]).rpc({ commitment: "confirmed" });

      let aliceBalanceT3 = await provider.connection.getBalance(alice.publicKey);
      let bobBalanceT3 = await provider.connection.getBalance(bob.publicKey);
      let charlieBalanceT3 = await provider.connection.getBalance(charlie.publicKey);
      let groupBalanceT3 = await provider.connection.getBalance(group1AccountKey);
      console.log("after alice settled");
      console.log("aliceBalance " + aliceBalanceT3);
      console.log("bobBalance   " + bobBalanceT3);
      console.log("charlie      " + charlieBalanceT3);
      console.log("group        " + groupBalanceT3);
      assert.closeTo(groupBalanceT0, groupBalanceT3, 2);
    });

  });

  describe("goup closure tests", async () => {
    it("alice closes the group", async () => {
      const [group1AccountKey, group1Bump] = getGroupAddress(group1Name, alice.publicKey, program.programId);

      await program.methods.deleteGroup().accounts({
        group: group1AccountKey,
        groupAdmin: alice.publicKey
      }).signers([alice]).rpc({ commitment: "confirmed" });
      let aliceBalance = await provider.connection.getBalance(alice.publicKey);
      console.log("aliceBalance " + aliceBalance);
    });
  });
});
