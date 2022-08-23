// deploy/00_deploy_streamer.js

const { ethers } = require("hardhat");

// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Streamer", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  const streamer = await ethers.getContract("Streamer", deployer);

  // ToDo: change address to your frontend address vvvv
  console.log("\n 🤹  Sending ownership to frontend address...\n");
  const ownershipTransaction = await streamer.transferOwnership(
    "0xdb0dFc84F0D18A29254aBe01debfb3dC69A1632c"
  );
  console.log("\n       confirming...\n");
  const ownershipResult = await ownershipTransaction.wait();
  if (ownershipResult) {
    console.log("       ✅ ownership transferred successfully!\n");
  }

  // If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  // const yourContract = await deploy("YourContract", [], {}, {
  //  LibraryName: **LibraryAddress**
  // });
};

module.exports.tags = ["Streamer"];
