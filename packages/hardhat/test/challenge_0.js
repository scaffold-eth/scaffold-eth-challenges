//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//

const hre = require("hardhat");

const { ethers } = hre;
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("🚩 Challenge 0: 🎟 Simple NFT Example 🤓", function () {
  this.timeout(120000);

  let myContract;

  // console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here

  describe("YourCollectible", function () {
    if (process.env.CONTRACT_ADDRESS) {
      it("Should connect to external contract", async function () {
        myContract = await ethers.getContractAt(
          "YourCollectible",
          process.env.CONTRACT_ADDRESS
        );
        console.log(
          "     🛰 Connected to external contract",
          myContract.address
        );
      });
    } else {
      it("Should deploy YourCollectible", async function () {
        const YourCollectible = await ethers.getContractFactory(
          "YourCollectible"
        );
        myContract = await YourCollectible.deploy();
      });
    }

    describe("mintItem()", function () {
      it("Should be able to mint an NFT", async function () {
        const [owner] = await ethers.getSigners();

        console.log("\t", " 🧑‍🏫 Tester Address: ", owner.address);

        const startingBalance = await myContract.balanceOf(owner.address);
        console.log("\t", " ⚖️ Starting balance: ", startingBalance.toNumber());

        console.log("\t", " 🔨 Minting...");
        const mintResult = await myContract.mintItem(
          owner.address,
          "QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr"
        );
        console.log("\t", " 🏷  mint tx: ", mintResult.hash);

        console.log("\t", " ⏳ Waiting for confirmation...");
        const txResult = await mintResult.wait(1);
        expect(txResult.status).to.equal(1);

        console.log(
          "\t",
          " 🔎 Checking new balance: ",
          startingBalance.toNumber()
        );
        expect(await myContract.balanceOf(owner.address)).to.equal(
          startingBalance.add(1)
        );
      });

      it("Should track tokens of owner by index", async function () {
        const [owner] = await ethers.getSigners();
        const startingBalance = await myContract.balanceOf(owner.address);
        const token = await myContract.tokenOfOwnerByIndex(
          owner.address,
          startingBalance.sub(1)
        );
        expect(token.toNumber()).to.greaterThan(0);
      });
    });
  });
});
