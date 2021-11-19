pragma solidity 0.8.4;

//import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor {

  YourToken yourToken;

  constructor(address tokenAddress) public {
    yourToken = YourToken(tokenAddress);
  }


  // ToDo: create a payable buyTokens() function:
  

  // ToDo: create a withdraw() function that lets the owner withdraw ETH
  

  // ToDo: create a sellTokens() function:
  

}
