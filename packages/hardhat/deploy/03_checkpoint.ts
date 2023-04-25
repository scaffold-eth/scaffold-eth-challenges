import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getDiamond } from "../utils/helpers";
import "dotenv";

const deployContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // TODO : Remove following line
  return;

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const cDiamond = await getDiamond(["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"]);

  deployer;
  cDiamond;
  deploy;

  // TODO : Add the new facet
  // HINT : follow the implementations in deploy/02_checkpoint or deploy/01_checkpoint

  // TODO : Call diamond, and include the newly added facet
  /*
    cDiamond = await getDiamond([
    "DiamondCutFacet",
    "OwnershipFacet",
    "DiamondLoupeFacet",
    "WithdrawFacet",
    "ConfigFacet",
  ]);
  */

  // TODO : Set the goal amount to 10 ETH
  // const tx = await cDiamond.setGoalAmount(ONE_ETHER.mul(10));
  // await tx.wait();
};

export default deployContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployContract.tags = ["CrowdfundrDiamond"];
