const contracts = {
  31337: [
    {
      name: "localhost",
      chainId: "31337",
      contracts: {
        CrowdfundrDiamond: {
          address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
          abi: [
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "facetAddress",
                      type: "address",
                    },
                    {
                      internalType: "enum IDiamond.FacetCutAction",
                      name: "action",
                      type: "uint8",
                    },
                    {
                      internalType: "bytes4[]",
                      name: "functionSelectors",
                      type: "bytes4[]",
                    },
                  ],
                  internalType: "struct IDiamond.FacetCut[]",
                  name: "_diamondCut",
                  type: "tuple[]",
                },
                {
                  components: [
                    {
                      internalType: "address",
                      name: "owner",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "init",
                      type: "address",
                    },
                    {
                      internalType: "bytes",
                      name: "initCalldata",
                      type: "bytes",
                    },
                  ],
                  internalType: "struct DiamondArgs",
                  name: "_args",
                  type: "tuple",
                },
              ],
              stateMutability: "payable",
              type: "constructor",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotAddFunctionToDiamondThatAlreadyExists",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4[]",
                  name: "_selectors",
                  type: "bytes4[]",
                },
              ],
              name: "CannotAddSelectorsToZeroAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotRemoveFunctionThatDoesNotExist",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotRemoveImmutableFunction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceFunctionThatDoesNotExists",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4[]",
                  name: "_selectors",
                  type: "bytes4[]",
                },
              ],
              name: "CannotReplaceFunctionsFromFacetWithZeroAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceImmutableFunction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_functionSelector",
                  type: "bytes4",
                },
              ],
              name: "FunctionNotFound",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "_action",
                  type: "uint8",
                },
              ],
              name: "IncorrectFacetCutAction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_initializationContractAddress",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "_calldata",
                  type: "bytes",
                },
              ],
              name: "InitializationFunctionReverted",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_contractAddress",
                  type: "address",
                },
                {
                  internalType: "string",
                  name: "_message",
                  type: "string",
                },
              ],
              name: "NoBytecodeAtAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_facetAddress",
                  type: "address",
                },
              ],
              name: "NoSelectorsProvidedForFacetForCut",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_facetAddress",
                  type: "address",
                },
              ],
              name: "RemoveFacetAddressMustBeZeroAddress",
              type: "error",
            },
            {
              stateMutability: "payable",
              type: "fallback",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
        CrowdfundrDiamondInit: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: [
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_minAmount",
                  type: "uint256",
                },
              ],
              name: "init",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        DiamondCutFacet: {
          address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
          abi: [
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotAddFunctionToDiamondThatAlreadyExists",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4[]",
                  name: "_selectors",
                  type: "bytes4[]",
                },
              ],
              name: "CannotAddSelectorsToZeroAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotRemoveFunctionThatDoesNotExist",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotRemoveImmutableFunction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceFunctionThatDoesNotExists",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceFunctionWithTheSameFunctionFromTheSameFacet",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4[]",
                  name: "_selectors",
                  type: "bytes4[]",
                },
              ],
              name: "CannotReplaceFunctionsFromFacetWithZeroAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_selector",
                  type: "bytes4",
                },
              ],
              name: "CannotReplaceImmutableFunction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "_action",
                  type: "uint8",
                },
              ],
              name: "IncorrectFacetCutAction",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_initializationContractAddress",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "_calldata",
                  type: "bytes",
                },
              ],
              name: "InitializationFunctionReverted",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_contractAddress",
                  type: "address",
                },
                {
                  internalType: "string",
                  name: "_message",
                  type: "string",
                },
              ],
              name: "NoBytecodeAtAddress",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_facetAddress",
                  type: "address",
                },
              ],
              name: "NoSelectorsProvidedForFacetForCut",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_user",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_contractOwner",
                  type: "address",
                },
              ],
              name: "NotContractOwner",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_facetAddress",
                  type: "address",
                },
              ],
              name: "RemoveFacetAddressMustBeZeroAddress",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "facetAddress",
                      type: "address",
                    },
                    {
                      internalType: "enum IDiamond.FacetCutAction",
                      name: "action",
                      type: "uint8",
                    },
                    {
                      internalType: "bytes4[]",
                      name: "functionSelectors",
                      type: "bytes4[]",
                    },
                  ],
                  indexed: false,
                  internalType: "struct IDiamond.FacetCut[]",
                  name: "_diamondCut",
                  type: "tuple[]",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "_init",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "bytes",
                  name: "_calldata",
                  type: "bytes",
                },
              ],
              name: "DiamondCut",
              type: "event",
            },
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "facetAddress",
                      type: "address",
                    },
                    {
                      internalType: "enum IDiamond.FacetCutAction",
                      name: "action",
                      type: "uint8",
                    },
                    {
                      internalType: "bytes4[]",
                      name: "functionSelectors",
                      type: "bytes4[]",
                    },
                  ],
                  internalType: "struct IDiamond.FacetCut[]",
                  name: "_diamondCut",
                  type: "tuple[]",
                },
                {
                  internalType: "address",
                  name: "_init",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "_calldata",
                  type: "bytes",
                },
              ],
              name: "diamondCut",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        DiamondLoupeFacet: {
          address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
          abi: [
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_functionSelector",
                  type: "bytes4",
                },
              ],
              name: "facetAddress",
              outputs: [
                {
                  internalType: "address",
                  name: "facetAddress_",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "facetAddresses",
              outputs: [
                {
                  internalType: "address[]",
                  name: "facetAddresses_",
                  type: "address[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_facet",
                  type: "address",
                },
              ],
              name: "facetFunctionSelectors",
              outputs: [
                {
                  internalType: "bytes4[]",
                  name: "_facetFunctionSelectors",
                  type: "bytes4[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "facets",
              outputs: [
                {
                  components: [
                    {
                      internalType: "address",
                      name: "facetAddress",
                      type: "address",
                    },
                    {
                      internalType: "bytes4[]",
                      name: "functionSelectors",
                      type: "bytes4[]",
                    },
                  ],
                  internalType: "struct IDiamondLoupe.Facet[]",
                  name: "facets_",
                  type: "tuple[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "bytes4",
                  name: "_interfaceId",
                  type: "bytes4",
                },
              ],
              name: "supportsInterface",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
        },
        MainFacet: {
          address: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_user",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_contractOwner",
                  type: "address",
                },
              ],
              name: "NotContractOwner",
              type: "error",
            },
            {
              inputs: [],
              name: "claim",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "contribute",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
          ],
        },
        OwnershipFacet: {
          address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_user",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_contractOwner",
                  type: "address",
                },
              ],
              name: "NotContractOwner",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "previousOwner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "owner_",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_newOwner",
                  type: "address",
                },
              ],
              name: "transferOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        WithdrawFacet: {
          address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_user",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_contractOwner",
                  type: "address",
                },
              ],
              name: "NotContractOwner",
              type: "error",
            },
            {
              inputs: [],
              name: "deadline",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "deadlineSet",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "refund",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_buffer",
                  type: "uint256",
                },
              ],
              name: "setDeadline",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        ConfigFacet: {
          address: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_user",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_contractOwner",
                  type: "address",
                },
              ],
              name: "NotContractOwner",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "setGoalAmount",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "setMinAmount",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
