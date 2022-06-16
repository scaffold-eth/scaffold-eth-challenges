const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");

use(solidity);

describe("🚩 Challenge 3: 🎲 Dice Game", function () {
  let deployer;
  let account1;
  let diceGame;
  let riggedRoll;

  this.timeout(125000);

  describe("⚙️ Setup contracts", function () {
    if(process.env.CONTRACT_ADDRESS){
      // live contracts, token already deployed
    }else{
      it("Should deploy DiceGame", async function () {
        const DiceGame = await ethers.getContractFactory("DiceGame");
        diceGame = await DiceGame.deploy();
      });
    }

    if(process.env.CONTRACT_ADDRESS){
      it("Should connect to external contract", async function () {
        riggedRoll = await ethers.getContractAt("RiggedRoll",process.env.CONTRACT_ADDRESS);
        console.log(`\t`,"🛰 Connected to:",riggedRoll.address)

        console.log(`\t`,"📡 Loading the diceGame address from the riggedRoll...")
        console.log(`\t`,"⚠️ Make sure *diceGame* is public in RiggedRoll.sol!")
        let diceGameAddress = await riggedRoll.diceGame();
        console.log('\t',"🏷 DiceGame Address:",diceGameAddress)

        diceGame = await ethers.getContractAt("DiceGame",diceGameAddress);
        console.log(`\t`,"🛰 Connected to DiceGame at:",diceGame.address)
      });
    }else{
      it("Should deploy RiggedRoll", async function () {
        const RiggedRoll = await ethers.getContractFactory("RiggedRoll");
        riggedRoll = await RiggedRoll.deploy(diceGame.address);
      });
    }

    it("Should connect RiggedRoll to DiceGame", async function () {
      [deployer, account1] = await ethers.getSigners();
      expect(await riggedRoll.diceGame()).to.equal(diceGame.address);
    });
  });

  describe("🔑 Rigged Rolls", function () {
    it("Should revert if balance less than .002 ethers", async function () {
      expect(riggedRoll.riggedRoll()).to.reverted;
    });

    it("Should transfer sufficient eth to RiggedRoll", async function () {
      await fundRiggedContract();
      let balance = await ethers.provider.getBalance(riggedRoll.address);
      expect(balance).to.above(ethers.utils.parseEther(".002"));
    });

    it("Should call rollTheDice for a roll less than 2", async () => {
      //first change states and create the inputs required to produce a roll <= 2
      let getRollLessThanTwo = true;
      let expectedRoll = await changeStatesToGetRequiredRoll(
        getRollLessThanTwo
      );
      console.log(
        "EXPECT ROLL TO BE LESS THAN OR EQUAL TO 2: ",
        expectedRoll.toNumber()
      );

      let tx = riggedRoll.riggedRoll();

      it("Should emit Roll event!", async () => {
        expect(tx)
          .to.emit(diceGame, "Roll")
          .withArgs(riggedRoll.address, expectedRoll);
      });

      it("Should emit Winner event!", async () => {
        expect(tx).to.emit(diceGame, "Winner");
      });
    });

    it("Should not call DiceGame for a roll greater than 2", async () => {
      let getRollLessThanTwo = false;
      let expectedRoll = await changeStatesToGetRequiredRoll(
        getRollLessThanTwo
      );
      console.log(
        "EXPECTED ROLL TO BE GREATER THAN 2: ",
        expectedRoll.toNumber()
      );

      expect(riggedRoll.riggedRoll()).to.reverted;
    });

    it("Should withdraw funds", async () => {
      //deployer is the owner by default so should be able to withdraw
      await fundRiggedContract();

      let prevBalance = await deployer.getBalance();
      await riggedRoll.withdraw(
        deployer.address,
        ethers.provider.getBalance(riggedRoll.address)
      );
      let curBalance = await deployer.getBalance();
      expect(prevBalance.lt(curBalance)).to.true;
    });
  });

  async function changeStatesToGetRequiredRoll(getRollLessThanTwo) {
    let expectedRoll;
    while (true) {
      let latestBlockNumber = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(latestBlockNumber);
      let prevHash = block.hash;
      let nonce = await diceGame.nonce();

      let hash = ethers.utils.solidityKeccak256(
        ["bytes32", "address", "uint256"],
        [prevHash, diceGame.address, nonce]
      );

      let bigNum = BigNumber.from(hash);
      expectedRoll = bigNum.mod(16);
      if (expectedRoll.lte(2) == getRollLessThanTwo) {
        break;
      }

      const options = { value: ethers.utils.parseEther("0.002") };
      await diceGame.rollTheDice(options);
    }
    return expectedRoll;
  }

  function fundRiggedContract() {
    return deployer.sendTransaction({
      to: riggedRoll.address,
      value: ethers.utils.parseEther("1"),
    });
  }
});
