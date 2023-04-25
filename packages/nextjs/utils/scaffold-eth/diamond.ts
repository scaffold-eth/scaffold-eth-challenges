export const getMainDiamondContract = (abi: any) => {
  const contracts: any = Object.keys(abi.contracts);
  return contracts.find((contractName: any) => {
    const contractAbi: any = contracts[contractName].abi;
    return contractAbi.find((item: any) => item.type === "fallback" && item.stateMutability === "payable");
  });
};
