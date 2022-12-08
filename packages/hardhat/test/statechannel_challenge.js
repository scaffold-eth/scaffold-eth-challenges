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

describe(" 🕞 Statechannel Challenge: The Guru's Offering 👑", function () {
  this.timeout(120000);
  let streamerContract;

  /**
   * asserts that the steamerContract's balance is equal to b,
   * denominated in ether
   *
   * @param {string} b
   */
  async function assertBalance(b) {
    const balance = await network.provider.send("eth_getBalance", [streamerContract.address]);
    console.log('\t',"💵 Balance",ethers.utils.formatEther(balance));
    expect(await network.provider.send("eth_getBalance", [streamerContract.address])).to.equal(ethers.utils.parseEther(b)); 
    return;
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

  describe("Streamer.sol", function () {

    let contractArtifact;
    if(process.env.CONTRACT_ADDRESS){
      contractArtifact = `contracts/${process.env.CONTRACT_ADDRESS}.sol:Streamer`
    } else {
      contractArtifact = "contracts/Streamer.sol:Streamer";
    }

    it("Should deploy the contract", async function () {
      const streamerFct = await ethers.getContractFactory(contractArtifact);
      streamerContract = await streamerFct.deploy();
      console.log('\t', "🛫 Contract deployed",streamerContract.address);
    });

    it("Should allow channel funding & emit Opened event", async function () {
      console.log('\t', "💸 Funding first channel...");
      const fundingTx = await streamerContract.fundChannel({
        value: ethers.utils.parseEther("1"),
      });
      console.log('\t',"⏫  Checking emit");
      await expect(fundingTx).to.emit(streamerContract, "Opened");
    });

    it("Should refuse multiple funding from single user", async function () {
      console.log('\t',"🔃 Attempting to fund the channel again...");
      await expect(
        streamerContract.fundChannel({
          value: ethers.utils.parseEther("1"), // first funded channel
        })
      ).to.be.reverted;
    });

    it("Should allow multiple client channels", async function () {
      const [, alice, bob] = await ethers.getSigners();

      console.log('\t',"💸 Funding a second channel...");
      await expect(
        streamerContract.connect(alice).fundChannel({
          value: ethers.utils.parseEther("1"), // second funded channel
        })
      ).to.emit(streamerContract, "Opened");

      console.log('\t',"💸 Funding a third channel...");
      await expect(
        streamerContract.connect(bob).fundChannel({
          value: ethers.utils.parseEther("1"), // third funded channel
        })
      ).to.emit(streamerContract, "Opened");

      console.log('\t',"💵 Expecting contract balance to equal 3...");
      await assertBalance("3"); // running total
    });

    it("Should allow legitimate withdrawals", async function () {
      const [, alice] = await ethers.getSigners();

      const updatedBalance = ethers.utils.parseEther("0.5"); // cut channel balance from 1 -> 0.5
      console.log('\t', "📩 Creating voucher...");
      const voucher = await createVoucher(updatedBalance, alice);

      console.log('\t', "🔼 Expecting to withdraw funds and emit Withdrawn...");
      await expect(streamerContract.withdrawEarnings(voucher)).to.emit(
        streamerContract,
        "Withdrawn"
      );
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // 3 - 0.5 = 2.5
    });

    it("Should refuse redundant withdrawals", async function () {
      const [, alice] = await ethers.getSigners();

      const updatedBalance = ethers.utils.parseEther("0.5"); // equal to the current balance, should fail
      console.log('\t', "📩 Creating voucher...");
      const voucher = await createVoucher(updatedBalance, alice);

      console.log('\t', "🛑 Attempting a redundant withdraw...");
      await expect(streamerContract.withdrawEarnings(voucher)).to.be.reverted;
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // contract total unchanged because withdrawal fails
    });

    it("Should refuse illegitimate withdrawals", async function () {
      const [, , , carol] = await ethers.getSigners(); // carol has no open channel

      const updatedBalance = ethers.utils.parseEther("0.5");
      console.log('\t', "📩 Creating voucher...");
      const voucher = await createVoucher(updatedBalance, carol);

      console.log('\t', "🛑 Attempting an illegitimate withdraw...");
      await expect(streamerContract.withdrawEarnings(voucher)).to.be.reverted;
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // contract total unchanged because carol has no channel
    });

    it("Should refuse defunding when no challenge has been registered", async function () {
      const [, , bob] = await ethers.getSigners();

      console.log('\t', "🛑 Attempting illegitimate defundChannel...");
      await expect(streamerContract.connect(bob).defundChannel()).to.be.reverted;
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // contract total unchanged because defund fails
    });

    it("Should emit a Challenged event", async function () {
      const [, , bob] = await ethers.getSigners();
      await expect(streamerContract.connect(bob).challengeChannel()).to.emit(
        streamerContract,
        "Challenged"
      );
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // contract total unchanged because challenge does not move funds
    });

    it("Should refuse defunding during the challenge period", async function () {
      const [, , bob] = await ethers.getSigners();

      console.log('\t',"🛑 Attempting illegitimate defundChannel...");
      await expect(streamerContract.connect(bob).defundChannel()).to.be.reverted;
      console.log('\t',"💵 Expecting contract balance to equal 2.5...");
      await assertBalance("2.5"); // contract total unchanged becaues defund fails
    });

    it("Should allow defunding after the challenge period", async function () {
      const [, , bob] = await ethers.getSigners();

      const initBobBalance = ethers.BigNumber.from(
        await network.provider.send("eth_getBalance", [bob.address])
      );
      console.log('\t', "💰 Initial user balance:",ethers.utils.formatEther(initBobBalance));
      console.log('\t', "🕐 Increasing time...");
      network.provider.send("evm_increaseTime", [3600]); // fast-forward one hour
      network.provider.send("evm_mine");

      console.log('\t', "💲 Attempting a legitimate defundChannel...");  
      await expect(streamerContract.connect(bob).defundChannel()).to.emit(
        streamerContract,
        "Closed"
      );
      console.log('\t',"💵 Expecting contract balance to equal 1.5...");
      await assertBalance("1.5"); // 2.5-1 = 1.5 (bob defunded his unused channel)

      const finalBobBalance = ethers.BigNumber.from(
        await network.provider.send("eth_getBalance", [bob.address])
      );

      console.log('\t',"💰 User's final balance:", ethers.utils.formatEther(finalBobBalance));
      // check that bob's channel balance returned to bob's address
      const difference = finalBobBalance.sub(initBobBalance);
      console.log('\t',"💵 Checking that final balance went up by ~1 eth. Increase", ethers.utils.formatEther(difference));
      assert(difference.gt(ethers.utils.parseEther("0.99")));
    });
  });
});
