import { FormatTypes } from "@ethersproject/abi";
import { Contract } from "ethers";
import hre from "hardhat";
import { CrowdfundrDiamond, DiamondCutFacet } from "../typechain-types";
import { ethers } from "hardhat";
export type GeneralContract = DiamondCutFacet | CrowdfundrDiamond;

export const SECONDS_IN_DAY: number = 60 * 60 * 24;
export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };
export const ONE_ETHER = ethers.utils.parseEther("1.0");

export async function getDiamond(facets: Array<string>): Promise<Contract> {
  const cDiamond = await hre.ethers.getContract("CrowdfundrDiamond");
  const generalABI: Array<string> = cDiamond.interface.format(FormatTypes.JSON) as Array<string>;
  for (const Facet of facets) {
    const cFacet = await hre.ethers.getContract(Facet);
    generalABI.push(...cFacet.interface.format(FormatTypes.JSON));
  }
  return hre.ethers.getContractAt(generalABI, cDiamond.address);
}

// get function selectors from ABI
export function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors: any = signatures.reduce((acc: Array<string>, val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

// get function selector from function signature
export function getSelector(func: string) {
  const abiInterface = new ethers.utils.Interface([func]);
  return abiInterface.getSighash(ethers.utils.Fragment.from(func));
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
function remove(this: any, functionNames: Array<string>) {
  const selectors = this.filter((v: any) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(this: any, functionNames: any) {
  const selectors = this.filter((v: any) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: any, signatures: any) {
  const iface = new ethers.utils.Interface(signatures.map((v: any) => "function " + v));
  const removeSelectors = signatures.map((v: any) => iface.getSighash(v));
  selectors = selectors.filter((v: any) => !removeSelectors.includes(v));
  return selectors;
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress: string, facets: any) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}
