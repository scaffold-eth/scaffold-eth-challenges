pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {

  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event SellTokens(address seller, uint256 amountOfETH, uint256 amountOfTokens);

  YourToken public yourToken;

  uint256 public constant tokensPerEth = 100;

  constructor(address tokenAddress) {
    yourToken = YourToken(tokenAddress);
  }

  // ToDo: create a payable buyTokens() function:
  function buyTokens() public payable {
    yourToken.transfer(msg.sender, uint256(msg.value * tokensPerEth));
    emit BuyTokens(msg.sender, msg.value, uint256(msg.value * tokensPerEth));
  }

  // ToDo: create a withdraw() function that lets the owner withdraw ETH
  function withdraw() public onlyOwner {
    (bool sent, bytes memory data) = owner().call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
  }

  // ToDo: create a sellTokens(uint256 _amount) function:
  function sellTokens(uint256 _amount) public {
    yourToken.transferFrom(msg.sender, address(this), _amount);
    (bool sent, bytes memory data) = msg.sender.call{value: uint256(_amount / tokensPerEth)}("");
    require(sent, "Failed to send Ether");
    emit SellTokens(msg.sender, uint256(_amount / tokensPerEth), _amount);
  }

}
