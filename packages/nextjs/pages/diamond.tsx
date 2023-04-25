import { useState } from "react";
import type { NextPage } from "next";
import { DiamondHeader } from "~~/components/diamond/DiamondHeader";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames, getMainDiamondContract } from "~~/utils/scaffold-eth/contractNames";

const Diamond: NextPage = () => {
  const contractNames: ContractName[] = getContractNames();
  const mainDiamondContractName: ContractName = getMainDiamondContract();
  const EIP2535Names: ContractName[] = ["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"];
  const facetNames: ContractName[] = contractNames.filter(
    (name: ContractName) => EIP2535Names.indexOf(name) === -1 && name !== mainDiamondContractName,
  );
  const [selectedEIP2535, setSelectedEIP2535] = useState<ContractName>(EIP2535Names[0]);
  const [selectedFacet, setSelectedFacet] = useState<ContractName>(facetNames[0]);
  console.log(`contractNames: ${JSON.stringify(contractNames)}`);
  console.log(`mainDiamondContractName: ${mainDiamondContractName}`);

  return (
    <>
      <DiamondHeader />
      <>
        {contractNames.length === 0 ? (
          <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
            <p className="text-3xl mt-14">No contracts found!</p>
          </div>
        ) : (
          <>
            <div className="text-center mt-8 bg-secondary p-10 mt-0">
              <h2 className="text-4xl my-0">Diamond Smart Contract</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <ContractUI contractName={mainDiamondContractName} />
            </div>
            <div className="text-center mt-8 bg-secondary p-10">
              <h2 className="text-4xl my-0">EIP-2535 Facets</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {EIP2535Names.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      contractName === selectedEIP2535 ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => setSelectedEIP2535(contractName)}
                  >
                    {contractName}
                  </button>
                ))}
              </div>
              {EIP2535Names.map(contractName => (
                <ContractUI
                  key={contractName}
                  contractName={contractName}
                  className={contractName === selectedEIP2535 ? "" : "hidden"}
                />
              ))}
            </div>
            <div className="text-center mt-8 bg-secondary p-10">
              <h2 className="text-4xl my-0">Facet Contracts</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {facetNames.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      contractName === selectedFacet ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => setSelectedFacet(contractName)}
                  >
                    {contractName}
                  </button>
                ))}
              </div>
              {facetNames.map(contractName => (
                <ContractUI
                  key={contractName}
                  contractName={contractName}
                  className={contractName === selectedFacet ? "" : "hidden"}
                />
              ))}
            </div>
          </>
        )}
      </>
    </>
  );
};

export default Diamond;
