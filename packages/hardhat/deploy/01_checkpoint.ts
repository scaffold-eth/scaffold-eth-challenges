import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getSelectors, FacetCutAction, getDiamond, ONE_ETHER } from "../utils/helpers";
import "dotenv";

const deployContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const dDiamondInit = await deploy("CrowdfundrDiamondInit", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const cDiamondInit = await hre.ethers.getContractAt(`CrowdfundrDiamondInit`, dDiamondInit.address);

  const FacetNames = ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"];

  const facetCuts = [];
  for (const FacetName of FacetNames) {
    const dFacet = await deploy(FacetName, {
      from: deployer,
      log: true,
      autoMine: true,
    });
    const cFacet = await hre.ethers.getContractAt(FacetName, dFacet.address);
    facetCuts.push({
      facetAddress: cFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(cFacet),
    });
  }

  // TODO  : Change this only ONE ETHER
  const functionCall = cDiamondInit.interface.encodeFunctionData("init(uint256)", [ONE_ETHER.mul(4)]);

  // Setting arguments that will be used in the diamond constructor
  const diamondArgs = {
    owner: deployer,
    init: cDiamondInit.address,
    initCalldata: functionCall,
  };
  // deploy Diamond
  await deploy("CrowdfundrDiamond", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [facetCuts, diamondArgs],
  });

  const cDiamond = await getDiamond(["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"]);

  // TODO : Add new facets

  const facetsToAdd = ["MainFacet"];

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
};

export default deployContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployContract.tags = ["CrowdfundrDiamond"];
