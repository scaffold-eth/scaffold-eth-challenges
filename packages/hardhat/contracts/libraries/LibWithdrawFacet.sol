pragma solidity ^0.8.0;

import "./LibDiamond.sol";

library LibWithdrawFacet {
  bytes32 constant WITHDRAW_STORAGE = keccak256("diamond.standard.withdraw.storage");

  struct WithdrawStorage {
    uint256 deadline;
    bool deadlineSet;
    uint256 claimedAmount;
  }

  function getStorage() internal pure returns (WithdrawStorage storage st) {
    bytes32 position = WITHDRAW_STORAGE;
    assembly {
      st.slot := position
    }
  }

  function _enforceDeadlineReached() internal view {
    uint256 deadline = getStorage().deadline;
    require(deadline != 0 && deadline < block.timestamp, "WithdrawFacet: Deadline has not been reached");
  }

  function _setDeadline(uint256 _buffer) internal {
    WithdrawStorage storage ds = getStorage();
    require(!ds.deadlineSet, "WithdrawFacet : Deadline can only be set once");
    ds.deadline = block.timestamp + _buffer;
    ds.deadlineSet = true;
  }
}
