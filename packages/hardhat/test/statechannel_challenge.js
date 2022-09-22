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
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
const { network } = require("hardhat");

use(solidity);

describe("Statechannel Challenge: The Guru's Offering", function () {
  this.timeout(120000);
  let streamerContract;

  /**
   * asserts that the steamerContract's balance is equal to b,
   * denominated in ether
   *
   * @param {string} b
   */
  async function assertBalance(b) {
    return expect(
      await network.provider.send("eth_getBalance", [streamerContract.address])
    ).to.equal(ethers.utils.parseEther(b));
  }

  /**
   * Creates a redeemable voucher for the given balance
   * in the name of `signer`
   *
   * @param {ethers.BigNumber} updatedBalance
   * @param {ethers.SignerWithAddress} signer
   * @returns
   */
  async function createVoucher(updatedBalance, signer) {
    const packed = ethers.utils.solidityPack(["uint256"], [updatedBalance]);
    const hashed = ethers.utils.keccak256(packed);
    const arrayified = ethers.utils.arrayify(hashed);

    const carolSig = await signer.signMessage(arrayified);

    const voucher = {
      updatedBalance,
      sig: ethers.utils.splitSignature(carolSig),
    };
    return voucher;
  }

  describe("contract Streamer.sol", function () {
    it("deploys", async function () {
      const streamerFct = await ethers.getContractFactory("Streamer");
      streamerContract = await streamerFct.deploy();
      // console.log(`Streamer deployed to: ${streamerContract.address}`);
    });

    it("allows channel funding & emits 'Opened' event", async function () {
      const fundingTx = await streamerContract.fundChannel({
        value: ethers.utils.parseEther("1"),
      });
      expect(fundingTx).to.emit(streamerContract, "Opened");
    });

    it("refuses multiple funding from single user", async function () {
      await expect(
        streamerContract.fundChannel({
          value: ethers.utils.parseEther("1"), // first funded channel
        })
      ).to.be.reverted;
    });

    it("allows multiple client channels", async function () {
      const [, alice, bob] = await ethers.getSigners();

      await expect(
        streamerContract.connect(alice).fundChannel({
          value: ethers.utils.parseEther("1"), // second funded channel
        })
      ).to.emit(streamerContract, "Opened");

      await expect(
        streamerContract.connect(bob).fundChannel({
          value: ethers.utils.parseEther("1"), // third funded channel
        })
      ).to.emit(streamerContract, "Opened");

      await assertBalance("3"); // running total
    });

    it("allows legitimate withdrawals", async function () {
      const [, alice] = await ethers.getSigners();

      const updatedBalance = ethers.utils.parseEther("0.5"); // cut channel balance from 1 -> 0.5
      const voucher = await createVoucher(updatedBalance, alice);

      await expect(streamerContract.withdrawEarnings(voucher)).to.emit(
        streamerContract,
        "Withdrawn"
      );
      await assertBalance("2.5"); // 3 - 0.5 = 2.5
    });

    it("refuses redundant withdrawals", async function () {
      const [, alice] = await ethers.getSigners();

      const updatedBalance = ethers.utils.parseEther("0.5"); // equal to the current balance, should fail
      const voucher = await createVoucher(updatedBalance, alice);

      await expect(streamerContract.withdrawEarnings(voucher)).to.be.reverted;
      await assertBalance("2.5"); // contract total unchanged because withdrawal fails
    });

    it("refuses illegitimate withdrawals", async function () {
      const [, , , carol] = await ethers.getSigners(); // carol has no open channel

      const updatedBalance = ethers.utils.parseEther("0.5");
      const voucher = await createVoucher(updatedBalance, carol);

      await expect(streamerContract.withdrawEarnings(voucher)).to.be.reverted;
      await assertBalance("2.5"); // contract total unchanged because carol has no channel
    });

    it("refusus defunding when no challenge has been registered", async function () {
      const [, , bob] = await ethers.getSigners();

      await expect(streamerContract.connect(bob).defundChannel()).to.be
        .reverted;
      await assertBalance("2.5"); // contract total unchanged because defund fails
    });

    it("emits a challenged event", async function () {
      const [, , bob] = await ethers.getSigners();
      await expect(streamerContract.connect(bob).challengeChannel()).to.emit(
        streamerContract,
        "Challenged"
      );
      await assertBalance("2.5"); // contract total unchanged because challenge does not move funds
    });

    it("refusus defunding during the challenge period", async function () {
      const [, , bob] = await ethers.getSigners();

      await expect(streamerContract.connect(bob).defundChannel()).to.be
        .reverted;
      await assertBalance("2.5"); // contract total unchanged becaues defund fails
    });

    it("allows defunding after the challenge period", async function () {
      const [, , bob] = await ethers.getSigners();

      const initBobBalance = ethers.BigNumber.from(
        await network.provider.send("eth_getBalance", [bob.address])
      );

      network.provider.send("evm_increaseTime", [3600]); // fast-forward one hour
      network.provider.send("evm_mine");

      await expect(streamerContract.connect(bob).defundChannel()).to.emit(
        streamerContract,
        "Closed"
      );
      await assertBalance("1.5"); // 2.5-1 = 1.5 (bob defunded his unused channel)

      const finalBobBalance = ethers.BigNumber.from(
        await network.provider.send("eth_getBalance", [bob.address])
      );

      // check that bob's channel balance returned to bob's address
      //
      // init + 1 is not exactly final because ether is spent as gas for
      // executing the tx
      const zeroPlusGasFee = initBobBalance.add(1).sub(finalBobBalance);
      assert(zeroPlusGasFee.lt(ethers.utils.parseEther("0.000000000001")));
    });
  });
});
