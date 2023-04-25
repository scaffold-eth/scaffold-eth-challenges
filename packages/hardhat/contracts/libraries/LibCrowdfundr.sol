pragma solidity ^0.8.0;

import "./LibDiamond.sol";

library LibCrowdfundr {
  bytes32 constant CROWDFUNDR_STORAGE_POSITION = keccak256("diamond.standard.crowdfundr.storage");
  struct FacetAddressAndSelectorPosition {
    address facetAddress;
    uint16 selectorPosition;
  }

  struct CrowdfundrStorage {
    uint256 targetAmount;
  }

  function getStorage() internal pure returns (CrowdfundrStorage storage st) {
    bytes32 position = CROWDFUNDR_STORAGE_POSITION;
    assembly {
      st.slot := position
    }
  }

  function _enforceMinAmount(uint256 _amount) internal view {
    uint256 minAmount = LibDiamond.diamondStorage().minAmount;
    require(minAmount == 0 || _amount >= minAmount, "Crowdfund: less than min amount");
  }

  function _goalHasBeenReached() internal view returns (bool) {
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    return (ds.targetAmount != 0 && ds.targetAmount <= ds.contributionAmount);
  }
}
