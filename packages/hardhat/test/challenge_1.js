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

describe("🚩 Challenge 1: 🥩 Decentralized Staking App", function () {

  this.timeout(120000);

  let stakerContract;
  let exampleExternalContract;

  //console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here

  describe("Staker", function () {

    let contractArtifact;
    if (process.env.CONTRACT_ADDRESS) {
      contractArtifact = `contracts/${process.env.CONTRACT_ADDRESS}.sol:Staker`
    } else {
      contractArtifact = "contracts/Staker.sol:Staker";
    }

    it("Should deploy ExampleExternalContract", async function () {
      const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
      exampleExternalContract = await ExampleExternalContract.deploy();
      console.log('\t',"🛰  exampleExternalContract contract deployed on", exampleExternalContract.address)
    });

    it("Should deploy Staker", async function () {
      const Staker = await ethers.getContractFactory(contractArtifact);
      stakerContract = await Staker.deploy(exampleExternalContract.address);
      console.log('\t',"🛰  Staker contract deployed on", stakerContract.address)
    });

    describe("   🥩 Stake!", function () {
      it("Balance should go up when you stake()", async function () {
        const [ owner ] = await ethers.getSigners();

        console.log('\t'," 🧑 Tester Address: ",owner.address)

        const startingBalance = await stakerContract.balances(owner.address)
        console.log('\t'," 💰 Starting balance: ",startingBalance.toNumber())

        console.log('\t'," 🔨 Staking...")
        const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("0.001")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳  Waiting for confirmation...")
        const txResult =  await stakeResult.wait()
        expect(txResult.status).to.equal(1, "Error while awaiting staking confirmation");

        const newBalance = await stakerContract.balances(owner.address)
        console.log('\t'," 🔎 New balance: ", ethers.utils.formatEther(newBalance))
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")),"Error with staking, balance did not increase enough.");

      });

      it("If enough is staked and time has passed, you should be able to complete", async function () {

        const timeLeft1 = await stakerContract.timeLeft()
        console.log('\t'," ⏱  There should be some time left. timeLeft:",timeLeft1.toNumber())
        expect(timeLeft1.toNumber()).to.greaterThan(0,"Error while expecting the time left to be greater than 0.");

        console.log('\t'," 🚀 Staking a full eth!")
        const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("1")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳  Fast forward time...")
        await network.provider.send("evm_increaseTime", [800000])
        await network.provider.send("evm_mine")

        const timeLeft2 = await stakerContract.timeLeft()
        console.log('\t'," ⏱  Time left should be down to 0 now. timeLeft:",timeLeft2.toNumber())
        expect(timeLeft2.toNumber()).to.equal(0, "Error while expecting time left to be 0.");

        console.log('\t'," 🎉 Calling execute")
        const execResult = await stakerContract.execute();
        console.log('\t'," 🏷  execResult: ",execResult.hash)

        const result = await exampleExternalContract.completed()
        console.log('\t'," 🥁 completed should be true. completed: ",result)
        expect(result).to.equal(true, "Error while expecting completed to be true.");

      })


      let redeployedContractArtifact;
      if (process.env.CONTRACT_ADDRESS) {
        redeployedContractArtifact = `contracts/${process.env.CONTRACT_ADDRESS}.sol:Staker`
      } else {
        redeployedContractArtifact = "contracts/Staker.sol:Staker";
      }

      it("Should redeploy Staker, stake, not have enough value, attempt to execute, then withdraw", async function () {
        const [ owner, secondAccount ] = await ethers.getSigners();

        const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
        exampleExternalContract = await ExampleExternalContract.deploy();

        const Staker = await ethers.getContractFactory(redeployedContractArtifact);
        stakerContract = await Staker.deploy(exampleExternalContract.address);

        console.log('\t'," 🔨 Staking...")
        const stakeResult = await stakerContract.connect(secondAccount).stake({value: ethers.utils.parseEther("0.001")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳  Waiting for confirmation...")
        const txResult =  await stakeResult.wait()
        expect(txResult.status).to.equal(1, "Error while awaiting the staking confirmation.");

        console.log('\t'," ⏳  Fast forward time...")
        await network.provider.send("evm_increaseTime", [800000])
        await network.provider.send("evm_mine")

        console.log('\t'," 🎉 Calling execute")
        const execResult = await stakerContract.execute();
        console.log('\t'," 🏷  execResult: ",execResult.hash)

        const result = await exampleExternalContract.completed()
        console.log('\t'," 🥁 completed should be false. completed: ",result)
        expect(result).to.equal(false, "Error expecting completed to be false.");

        const startingBalance = await ethers.provider.getBalance(secondAccount.address);

        console.log('\t'," 💵 Calling withdraw")
        const withdrawResult = await stakerContract.connect(secondAccount).withdraw();
        console.log('\t'," 🏷  withdrawResult: ",withdrawResult.hash)

        // need to account for the gas cost from calling withdraw
        const tx = await ethers.provider.getTransaction(withdrawResult.hash);
        const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
        const gasCost = tx.gasPrice.mul(receipt.gasUsed);

        const endingBalance = await ethers.provider.getBalance(secondAccount.address);

        expect(endingBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")).sub(gasCost),"Error while withdrawing");

      });
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
