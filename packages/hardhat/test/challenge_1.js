//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//

const hre = require("hardhat");
const { ethers } = hre;
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe('Staker dApp', () => {
  let owner;
  let addr1;
  let addr2;
  let addrs;

  let stakerContract;
  let exampleExternalContract;
  let ExampleExternalContractFactory;

  beforeEach(async () => {
    // Deploy ExampleExternalContract contract
    ExampleExternalContractFactory = await ethers.getContractFactory('ExampleExternalContract');
    exampleExternalContract = await ExampleExternalContractFactory.deploy();

    // Deploy Staker Contract
    const StakerContract = await ethers.getContractFactory('Staker');
    stakerContract = await StakerContract.deploy(exampleExternalContract.address);

    // eslint-disable-next-line no-unused-vars
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  describe('Test contract utils methods', () => {
    it('timeLeft() return 0 after deadline', async () => {
      await increaseWorldTimeInSeconds(180, true);

      const timeLeft = await stakerContract.timeLeft();
      expect(timeLeft).to.equal(0);
    });

    it('timeLeft() return correct timeleft after 10 seconds', async () => {
      const secondElapsed = 10;
      const timeLeftBefore = await stakerContract.timeLeft();
      await increaseWorldTimeInSeconds(secondElapsed, true);

      const timeLeftAfter = await stakerContract.timeLeft();
      expect(timeLeftAfter).to.equal(timeLeftBefore.sub(secondElapsed));
    });
  });

  describe('Test stake() method', () => {
    it('Stake event emitted', async () => {
      const amount = ethers.utils.parseEther('0.5');

      await expect(
        stakerContract.connect(addr1).stake({
          value: amount,
        }),
      )
        .to.emit(stakerContract, 'Stake')
        .withArgs(addr1.address, amount);

      // Check that the contract has the correct amount of ETH we just sent
      const contractBalance = await ethers.provider.getBalance(stakerContract.address);
      expect(contractBalance).to.equal(amount);

      // Check that the contract has stored in our balances state the correct amount
      const addr1Balance = await stakerContract.balances(addr1.address);
      expect(addr1Balance).to.equal(amount);
    });

    it('Stake 0.5 ETH from single user', async () => {
      const amount = ethers.utils.parseEther('0.5');
      const tx = await stakerContract.connect(addr1).stake({
        value: amount,
      });
      await tx.wait();

      // Check that the contract has the correct amount of ETH we just sent
      const contractBalance = await ethers.provider.getBalance(stakerContract.address);
      expect(contractBalance).to.equal(amount);

      // Check that the contract has stored in our balances state the correct amount
      const addr1Balance = await stakerContract.balances(addr1.address);
      expect(addr1Balance).to.equal(amount);
    });

    it('Stake reverted if deadline is reached', async () => {
      // Let deadline be reached
      await increaseWorldTimeInSeconds(180, true);

      const amount = ethers.utils.parseEther('0.5');
      await expect(
        stakerContract.connect(addr1).stake({
          value: amount,
        }),
      ).to.be.revertedWith('Deadline is already reached');
    });

    it('Stake reverted if external contract is completed', async () => {
      const amount = ethers.utils.parseEther('1');
      // Complete the stake process
      const txStake = await await stakerContract.connect(addr1).stake({
        value: amount,
      });
      await txStake.wait();

      // execute it
      const txExecute = await stakerContract.connect(addr1).execute();
      await txExecute.wait();

      await expect(
        stakerContract.connect(addr1).stake({
          value: amount,
        }),
      ).to.be.revertedWith('staking process already completed');
    });
  });

  describe('Test execute() method', () => {
    it('execute reverted because stake amount not reached threshold', async () => {
      await expect(stakerContract.connect(addr1).execute()).to.be.revertedWith('Threshold not reached');
    });

    it('execute reverted because external contract already completed', async () => {
      const amount = ethers.utils.parseEther('1');
      await stakerContract.connect(addr1).stake({
        value: amount,
      });
      await stakerContract.connect(addr1).execute();

      await expect(stakerContract.connect(addr1).execute()).to.be.revertedWith('staking process already completed');
    });

    it('execute reverted because deadline is reached', async () => {
      // reach the deadline
      await increaseWorldTimeInSeconds(180, true);

      await expect(stakerContract.connect(addr1).execute()).to.be.revertedWith('Deadline is already reached');
    });

    it('external contract sucessfully completed', async () => {
      const amount = ethers.utils.parseEther('1');
      await stakerContract.connect(addr1).stake({
        value: amount,
      });
      await stakerContract.connect(addr1).execute();

      // it seems to be a waffle bug see https://github.com/EthWorks/Waffle/issues/469
      // test that our Stake Contract has successfully called the external contract's complete function
      // expect('complete').to.be.calledOnContract(exampleExternalContract);

      // check that the external contract is completed
      const completed = await exampleExternalContract.completed();
      expect(completed).to.equal(true);

      // check that the external contract has the staked amount in it's balance
      const externalContractBalance = await ethers.provider.getBalance(exampleExternalContract.address);
      expect(externalContractBalance).to.equal(amount);

      // check that the staking contract has 0 balance
      const contractBalance = await ethers.provider.getBalance(stakerContract.address);
      expect(contractBalance).to.equal(0);
    });
  });

  describe('Test withdraw() method', () => {
    it('Withdraw reverted if deadline is not reached', async () => {
      await expect(stakerContract.connect(addr1).withdraw(addr1.address)).to.be.revertedWith(
        'Deadline is not reached yet',
      );
    });

    it('Withdraw reverted if external contract is completed', async () => {
      // Complete the stake process
      const txStake = await stakerContract.connect(addr1).stake({
        value: ethers.utils.parseEther('1'),
      });
      await txStake.wait();

      // execute it
      const txExecute = await stakerContract.connect(addr1).execute();
      await txExecute.wait();

      // Let time pass
      await increaseWorldTimeInSeconds(180, true);

      await expect(stakerContract.connect(addr1).withdraw(addr1.address)).to.be.revertedWith(
        'staking process already completed',
      );
    });

    it('Withdraw reverted if address has no balance', async () => {
      // Let time pass
      await increaseWorldTimeInSeconds(180, true);

      await expect(stakerContract.connect(addr1).withdraw(addr1.address)).to.be.revertedWith(
        "You don't have balance to withdraw",
      );
    });

    it('Withdraw success!', async () => {
      // Complete the stake process
      const amount = ethers.utils.parseEther('1');
      const txStake = await stakerContract.connect(addr1).stake({
        value: amount,
      });
      await txStake.wait();

      // Let time pass
      await increaseWorldTimeInSeconds(180, true);

      const txWithdraw = await stakerContract.connect(addr1).withdraw(addr1.address);
      await txWithdraw.wait();

      // Check that the balance of the contract is 0
      const contractBalance = await ethers.provider.getBalance(stakerContract.address);
      expect(contractBalance).to.equal(0);

      // Check that the balance of the user is +1
      await expect(txWithdraw).to.changeEtherBalance(addr1, amount);
    });
  });
});

describe("🚩 Challenge 1: 🥩 Decentralized Staking App", function () {

  this.timeout(120000);

  let stakerContract;
  let exampleExternalContract;

  //console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here

  describe("Staker", function () {

    if(process.env.CONTRACT_ADDRESS){
      it("Should connect to external contract", async function () {
        stakerContract = await ethers.getContractAt("Staker",process.env.CONTRACT_ADDRESS);
        console.log("     🛰 Connected to external contract",stakerContract.address)
      });
    }else{
      it("Should deploy ExampleExternalContract", async function () {
        const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
        exampleExternalContract = await ExampleExternalContract.deploy();
      });
      it("Should deploy Staker", async function () {
        const Staker = await ethers.getContractFactory("Staker");
        stakerContract = await Staker.deploy(exampleExternalContract.address);
      });
    }

    describe("🥩 Stake!", function () {
      it("Balance should go up when you stake()", async function () {
        const [ owner ] = await ethers.getSigners();

        console.log('\t'," 🧑‍🏫 Tester Address: ",owner.address)

        const startingBalance = await stakerContract.balances(owner.address)
        console.log('\t'," ⚖️ Starting balance: ",startingBalance.toNumber())

        console.log('\t'," 🔨 Staking...")
        const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("0.001")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳ Waiting for confirmation...")
        const txResult =  await stakeResult.wait()
        expect(txResult.status).to.equal(1);

        const newBalance = await stakerContract.balances(owner.address)
        console.log('\t'," 🔎 New balance: ", ethers.utils.formatEther(newBalance))
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")));

      });


      if(process.env.CONTRACT_ADDRESS){
        console.log(" 🤷 since we will run this test on a live contract this is as far as the automated tests will go...")
      }else{

        it("If enough is staked and time has passed, you should be able to complete", async function () {

          const timeLeft1 = await stakerContract.timeLeft()
          console.log('\t',"⏱ There should be some time left: ",timeLeft1.toNumber())
          expect(timeLeft1.toNumber()).to.greaterThan(0);

          console.log('\t'," 🚀 Staking a full eth!")
          const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("1")});
          console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

          console.log('\t'," ⌛️ fast forward time...")
          await network.provider.send("evm_increaseTime", [3600])
          await network.provider.send("evm_mine")

          const timeLeft2 = await stakerContract.timeLeft()
          console.log('\t',"⏱ Time should be up now: ",timeLeft2.toNumber())
          expect(timeLeft2.toNumber()).to.equal(0);

          console.log('\t'," 🎉 calling execute")
          const execResult = await stakerContract.execute();
          console.log('\t'," 🏷  execResult: ",execResult.hash)

          const result = await exampleExternalContract.completed()
          console.log('\t'," 🥁 complete: ",result)
          expect(result).to.equal(true);

        })



        it("Should redeploy Staker, stake, not get enough, and withdraw", async function () {
          const [ owner, secondAccount ] = await ethers.getSigners();

          const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
          exampleExternalContract = await ExampleExternalContract.deploy();

          const Staker = await ethers.getContractFactory("Staker");
          stakerContract = await Staker.deploy(exampleExternalContract.address);

          console.log('\t'," 🔨 Staking...")
          const stakeResult = await stakerContract.connect(secondAccount).stake({value: ethers.utils.parseEther("0.001")});
          console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

          console.log('\t'," ⏳ Waiting for confirmation...")
          const txResult =  await stakeResult.wait()
          expect(txResult.status).to.equal(1);

          console.log('\t'," ⌛️ fast forward time...")
          await network.provider.send("evm_increaseTime", [3600])
          await network.provider.send("evm_mine")

          console.log('\t'," 🎉 calling execute")
          const execResult = await stakerContract.execute();
          console.log('\t'," 🏷  execResult: ",execResult.hash)

          const result = await exampleExternalContract.completed()
          console.log('\t'," 🥁 complete should be false: ",result)
          expect(result).to.equal(false);

          const startingBalance = await ethers.provider.getBalance(secondAccount.address);

          console.log('\t'," 💵 calling withdraw")
          const withdrawResult = await stakerContract.connect(secondAccount).withdraw();
          console.log('\t'," 🏷  withdrawResult: ",withdrawResult.hash)
          
          // need to account for the gas cost from calling withdraw
          const tx = await ethers.provider.getTransaction(withdrawResult.hash);
          const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
          const gasCost = tx.gasPrice.mul(receipt.gasUsed);
          
          const endingBalance = await ethers.provider.getBalance(secondAccount.address);

          expect(endingBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")).sub(gasCost));
          
        });
      }
      //

      /*it("Should track tokens of owner by index", async function () {
        const [ owner ] = await ethers.getSigners();
        const startingBalance = await myContract.balanceOf(owner.address)
        const token = await myContract.tokenOfOwnerByIndex(owner.address,startingBalance.sub(1));
        expect(token.toNumber()).to.greaterThan(0);
      });*/
    });
  });
});
