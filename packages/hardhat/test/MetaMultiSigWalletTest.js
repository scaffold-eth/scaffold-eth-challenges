const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MetaMultiSigWallet Test", () => {
  let metaMultiSigWallet;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  const CHAIN_ID = 1; // I guess this number doesn't really matter
  let signatureRequired = 1; // Starting with something straithforward

  // Running this before each test
  // Deploys MetaMultiSigWallet and sets up some addresses for easier testing
  beforeEach(async function () {
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    let metaMultiSigWalletFactory = await ethers.getContractFactory("MetaMultiSigWallet");

    metaMultiSigWallet = await metaMultiSigWalletFactory.deploy(CHAIN_ID, [owner.address], signatureRequired);
  });

  describe("Deployment", () => {
    it("isOwner should return true for the owner address", async () => {     
      expect(await metaMultiSigWallet.isOwner(owner.address)).to.equal(true);
    });
  });
});
