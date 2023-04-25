import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getSelectors, FacetCutAction, getDiamond, SECONDS_IN_DAY } from "../utils/helpers";
import "dotenv";

const deployContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // TODO : Remove following line
  return;

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  let cDiamond = await getDiamond(["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"]);

  // IMPORTANT : Check how a facet is added

  const facetsToAdd = ["WithdrawFacet"];

  for (const facet of facetsToAdd) {
    await deploy(facet, {
      from: deployer,
      log: true,
      autoMine: true,
    });
    const cFacet = await hre.ethers.getContract(facet);
    const selectors = getSelectors(cFacet); // selectors of this facet
    const tx = await cDiamond.diamondCut(
      [
        {
          facetAddress: cFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      hre.ethers.constants.AddressZero,
      "0x",
      { gasLimit: 800000 },
    );
    await tx.wait();
  }
  cDiamond = await getDiamond(["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet", "WithdrawFacet"]);
  SECONDS_IN_DAY;
  // TODO : change the deadline - 2 Seconds
  // const tx = await cDiamond.setDeadline(120);
  // await tx.wait();
};

export default deployContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployContract.tags = ["CrowdfundrDiamond"];
