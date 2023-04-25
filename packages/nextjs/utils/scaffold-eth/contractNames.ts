import scaffoldConfig from "~~/scaffold.config";
import { ContractName, contracts } from "~~/utils/scaffold-eth/contract";

export function getContractNames() {
  const contractsData = contracts?.[scaffoldConfig.targetNetwork.id]?.[0]?.contracts;
  return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
}

export const getMainDiamondContract = () => {
  const contractsData: any = contracts?.[scaffoldConfig.targetNetwork.id]?.[0]?.contracts;
  const contractNames: any = Object.keys(contractsData);
  return contractNames.find((contractName: any) => {
    const contractAbi: any = contractsData[contractName].abi;
    return contractAbi.find((item: any) => item.type === "fallback" && item.stateMutability === "payable");
  });
};
