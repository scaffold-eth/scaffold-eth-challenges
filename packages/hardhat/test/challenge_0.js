const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("🚩 Challenge 0: 🎟 Simple NFT Example 🤓", function () {
  let myContract;

  describe("YourCollectible", function () {
    it("Should deploy YourCollectible", async function () {
      const YourCollectible = await ethers.getContractFactory("YourCollectible");

      myContract = await YourCollectible.deploy();
    });

    describe("mintItem()", function () {
      it("Should be able to mint an NFT", async function () {
        const [owner] = await ethers.getSigners();
        const startingBalance = await myContract.balanceOf(owner.address)
        await myContract.mintItem(owner.address, "QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr");
        expect(await myContract.balanceOf(owner.address)).to.equal(startingBalance.add(1));

        const token = await myContract.tokenOfOwnerByIndex(owner.address,startingBalance);
        expect(token.toNumber()).to.greaterThan(0);
      });

      it("Should track tokens of owner by index", async function () {
        const [owner] = await ethers.getSigners();
        const startingBalance = await myContract.balanceOf(owner.address)
        const token = await myContract.tokenOfOwnerByIndex(owner.address,startingBalance.sub(1));
        expect(token.toNumber()).to.greaterThan(0);
      });
    });
  });
});
