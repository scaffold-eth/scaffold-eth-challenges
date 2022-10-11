const contractListPromise = import("../contracts/hardhat_contracts.json");

export const loadAppContracts = async () => {
  const config = {};
  config.deployedContracts = (await contractListPromise).default ?? {};
  return config;
};
