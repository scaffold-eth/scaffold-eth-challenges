pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";
import "../libraries/LibCrowdfundr.sol";
import "../libraries/LibWithdrawFacet.sol";

contract WithdrawFacet {
  function refund() external {
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    uint256 toSend = ds.contributionPerUser[msg.sender];

    // TODO : enforce check for deadline if there is any
    // LibWithdrawFacet._enforceDeadlineReached();

    // TODO : enforce goal has not been reached
    // bool hasBeenReached = LibCrowdfundr._goalHasBeenReached();
    // require(!hasBeenReached, "WithdrawFacet: Cannot withdraw because goal amount has been reached");

    ds.contributionPerUser[msg.sender] = 0;

    payable(msg.sender).transfer(toSend);
  }

  function setDeadline(uint256 _buffer) external {
    LibDiamond.enforceIsContractOwner();
    LibWithdrawFacet._setDeadline(_buffer);
  }

  function deadline() external view returns (uint256) {
    return LibWithdrawFacet.getStorage().deadline;
  }

  function deadlineSet() external view returns (bool) {
    return LibWithdrawFacet.getStorage().deadlineSet;
  }
}
