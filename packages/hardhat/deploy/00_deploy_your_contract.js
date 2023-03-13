// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // await deploy("Balloons", {
  //   from: deployer,
  //   log: true,
  //   waitConfirmations: 5,
  // });

  const balloons = await ethers.getContract("Balloons", deployer);

  if (chainId !== "31337") {
    try {
      console.log(" 🎫 Verifing Contract on Etherscan... ");
      await run("verify:verify", {
        address: balloons.address,
        contract: "contracts/Balloons.sol:Balloons",
      });
    } catch (e) {
      console.log(" ⚠️ Failed to verify contract on Etherscan ");
    }
  }

  await deploy("DEX", {
    from: deployer,
    args: [balloons.address],
    log: true,
    waitConfirmations: 5,
  });

  const dex = await ethers.getContract("DEX", deployer);

  console.log(
    "Approving DEX (" + dex.address + ") to take Balloons from main account..."
  );
  await balloons.approve(dex.address, ethers.utils.parseEther("1"));

  console.log("INIT exchange...");
  await dex.init(ethers.utils.parseEther("0.05"), {
    value: ethers.utils.parseEther("0.05"),
    gasLimit: 200000,
  });

  if (chainId !== "31337") {
    try {
      console.log(" 🎫 Verifing Contract on Etherscan... ");
      await run("verify:verify", {
        address: dex.address,
        contract: "contracts/DEX.sol:DEX",
        constructorArguments: [balloons.address],
      });
    } catch (e) {
      console.log(" ⚠️ Failed to verify contract on Etherscan ");
    }
  }
};

module.exports.tags = ["Balloons", "DEX"];