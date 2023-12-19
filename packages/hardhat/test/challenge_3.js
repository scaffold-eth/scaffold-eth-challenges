import hre from "hardhat";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { JsonRpcProvider } from "@ethersproject/providers";

const { ethers } = hre;

describe("🚩 Challenge 3: 🎲 Dice Game", function () {
  let deployer: SignerWithAddress;
  let diceGame: Contract;
  let riggedRoll: Contract;
  let provider: JsonRpcProvider;

  const rollAmountString = ".002";
  const rollAmount = ethers.utils.parseEther(rollAmountString);

  async function deployContracts() {
    const DiceGame = await ethers.getContractFactory("DiceGame");
    diceGame = await DiceGame.deploy();

    let contractArtifact;
    if (process.env.CONTRACT_ADDRESS) {
      contractArtifact = `contracts/${process.env.CONTRACT_ADDRESS}.sol:RiggedRoll`;
    } else {
      contractArtifact = "contracts/RiggedRoll.sol:RiggedRoll";
    }

    const RiggedRoll = await ethers.getContractFactory(contractArtifact);
    riggedRoll = await RiggedRoll.deploy(diceGame.address);

    [deployer] = await ethers.getSigners();
    provider = ethers.provider;
  }

  function fundRiggedContract() {
    return deployer.sendTransaction({
      to: riggedRoll.address,
      value: rollAmount,
    });
  }

  async function getRoll(getRollLessThanFive: boolean) {
    let expectedRoll;
    while (true) {
      const latestBlockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(latestBlockNumber);
      const prevHash = block.hash;
      const nonce = await diceGame.nonce();

      const hash = ethers.utils.solidityKeccak256(
        ["bytes32", "address", "uint256"],
        [prevHash, diceGame.address, nonce],
      );

      const bigNum = BigNumber.from(hash);
      expectedRoll = bigNum.mod(16);
      if (expectedRoll.lte(5) == getRollLessThanFive) {
        break;
      }

      const options = { value: rollAmount };
      await diceGame.rollTheDice(options);
    }
    return expectedRoll;
  }

  describe("⚙  Setup contracts", function () {
    it("Should deploy contracts", async function () {
      await deployContracts();
      expect(await riggedRoll.diceGame()).to.equal(diceGame.address);
    });

    it(`Should revert if balance is less than ${rollAmountString} ethers`, async function () {
      await expect(riggedRoll.riggedRoll()).to.be.reverted;
    });

    it("Should transfer sufficient eth to RiggedRoll", async function () {
      console.log("\t", "💸 Funding RiggedRoll contract");
      await fundRiggedContract();
      const balance = await provider.getBalance(riggedRoll.address);
      console.log("\t", "💲 RiggedRoll balance: ", ethers.utils.formatEther(balance));
      expect(balance).to.gte(rollAmount, `Error when expecting DiceGame contract to have >= ${rollAmount} eth`);
    });
  });

  describe("🔑 Rigged Rolls", function () {
    it("Should call diceGame.rollTheDice for a roll <= 5", async () => {
      const getRollLessThanFive = true;
      const expectedRoll = await getRoll(getRollLessThanFive);
      console.log("\t", "🎲 Expect roll to be less than or equal to 5. Dice Game Roll:", expectedRoll.toNumber());

      const tx = await riggedRoll.riggedRoll();
      await expect(tx).to.emit(diceGame, "Roll").withArgs(riggedRoll.address, rollAmount, expectedRoll);
      await expect(tx).to.emit(diceGame, "Winner");
    });

    it("Should not call diceGame.rollTheDice for a roll > 5", async () => {
      const getRollLessThanFive = false;
      const expectedRoll = await getRoll(getRollLessThanFive);
      console.log("\t", "🎲 Expect roll to be greater than 5. Dice Game Roll:", expectedRoll.toNumber());
      console.log("\t", "◀  Expect riggedRoll to be reverted");

      await expect(riggedRoll.riggedRoll()).to.be.reverted;
    });

    it("Should withdraw funds", async () => {
      console.log("\t", "💸 Funding RiggedRoll contract");
      await fundRiggedContract();

      const prevBalance = await deployer.getBalance();
      console.log("\t", "💲 Current RiggedRoll balance: ", ethers.utils.formatEther(prevBalance));
      await riggedRoll.withdraw(deployer.address, provider.getBalance(riggedRoll.address));

      const curBalance = await deployer.getBalance();
      console.log("\t", "💲 New RiggedRoll balance: ", ethers.utils.formatEther(curBalance));

      expect(prevBalance.lt(curBalance), "Error when expecting RiggedRoll balance to increase when calling withdraw").to
        .true;
    });
  });
});
