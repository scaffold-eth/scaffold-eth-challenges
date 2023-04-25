pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";

contract ConfigFacet {
  function setMinAmount(uint256 _amount) external {
    LibDiamond.enforceIsContractOwner();
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    ds.minAmount = _amount;
  }

  function setGoalAmount(uint256 _amount) external {
    LibDiamond.enforceIsContractOwner();
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    ds.targetAmount = _amount;
  }
}
