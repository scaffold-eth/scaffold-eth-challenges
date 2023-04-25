pragma solidity ^0.8.0;
import "../libraries/LibCrowdfundr.sol";
import "../libraries/LibDiamond.sol";

contract MainFacet {
  function contribute() external payable {
    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

    LibCrowdfundr._enforceMinAmount(msg.value);

    ds.contributionAmount += msg.value;
    ds.contributionPerUser[msg.sender] += msg.value;
  }

  function claim() external {
    LibDiamond.enforceIsContractOwner();

    // TODO : Enforce goal was reached
    // bool hasReached = LibCrowdfundr._goalHasBeenReached();
    // require(hasReached, "Main: goal hasnt been reached or set");

    payable(msg.sender).transfer(address(this).balance);
  }
}
