import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
// import { time } from "@nomicfoundation/hardhat-network-helpers";
import { getDiamond } from "../utils/helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ONE_ETHER } from "../utils/helpers";
import "dotenv";

// const checkpoint = process.env.CHECKPOINT!;

// Bump the timestamp by a specific amount of seconds
// const timeTravel = async (seconds: number): Promise<number> => {
//   return time.increase(seconds);
// };

describe("Crowdfundr", function () {
  // We define a fixture to reuse the same setup in every test.

  let cDiamond: Contract;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let tay: SignerWithAddress;
  before(async () => {
    [deployer, alice, bob, tay] = await ethers.getSigners();
  });
  describe("Check All functions", () => {
    before(async () => {
      cDiamond = await getDiamond([
        "DiamondCutFacet",
        "DiamondLoupeFacet",
        "MainFacet",
        "OwnershipFacet",
        "WithdrawFacet",
      ]);
    });
    it("Contributes right amount", async () => {
      const diamondBalanceBefore = await ethers.provider.getBalance(cDiamond.address);
      await cDiamond.connect(alice).contribute({ value: ONE_ETHER });
      const diamondBalanceAfter = await ethers.provider.getBalance(cDiamond.address);
      expect(diamondBalanceAfter).to.equal(diamondBalanceBefore.add(ONE_ETHER));
    });
    it("Not Owner cannot withdraw", async () => {
      await expect(cDiamond.connect(alice).claim()).to.be.reverted;
    });
    it("Owner cannot claim because not goalAmount", async () => {
      await expect(cDiamond.claim()).to.be.revertedWith("Main: goal hasnt been reached or set");
    });

    it("Contributor cannot refund because deadlined hasnt passed", async () => {
      await expect(cDiamond.connect(alice).refund()).to.be.revertedWith("WithdrawFacet: Deadline has not been reached");
    });
    it("Owner can claim because goal amount reached", async () => {
      await expect(cDiamond.claim()).to.be.revertedWith("Main: goal hasnt been reached or set");
      await cDiamond.connect(alice).contribute({ value: ONE_ETHER.mul(9) }); // amount reached here
      await cDiamond.claim();
      const balance = await ethers.provider.getBalance(cDiamond.address);
      expect(balance).to.equal(0);

      deployer;
      bob;
      tay;
    });
  });
});
