// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();


  /*let jb = await deploy("JB", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });


  let wethy = await deploy("WETH9", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });
*/


  //console.log("deployed weth mock at address ",wethy.address)
  // Getting a previousl

  await deploy("YourCollectible", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //wethy.address, //0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, //wethy.address,
      "0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397", //jb.address, //0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397, // jb payment terminal
      3600,
      "QmVFxBSW5aFLKRQKtjEnGw8kKGsqy27Czcj22f3ksdSBnu",
      44
    ],
    log: true,
  });

  // Getting a previously deployed contract
  const yourCollectible = await ethers.getContract("YourCollectible", deployer);

  // ToDo: Verify your contract with Etherscan for public chains
  // if (chainId !== "31337") {
  //   try {
  //     console.log(" 🎫 Verifing Contract on Etherscan... ");
  //     await sleep(3000); // wait 3 seconds for deployment to propagate bytecode
  //     await run("verify:verify", {
  //       address: yourCollectible.address,
  //       contract: "contracts/YourCollectible.sol:YourCollectible",
  //       // contractArguments: [yourToken.address],
  //     });
  //   } catch (e) {
  //     console.log(" ⚠️ Failed to verify contract on Etherscan ");
  //   }
  // }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.tags = ["YourCollectible"];
