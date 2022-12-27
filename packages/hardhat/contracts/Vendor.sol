pragma solidity 0.8.4;  //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {

  uint256 public constant tokensPerEth = 100;

  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

  YourToken public yourToken;

  constructor(address tokenAddress) {
    yourToken = YourToken(tokenAddress);
  }

  // ToDo: create a payable buyTokens() function:
  function buyTokens() public payable {
    require (msg.value > 0, "Must be greater than 0!");
    uint256 amountToTransfer = msg.value * tokensPerEth;
    yourToken.transfer(msg.sender, amountToTransfer);
    emit BuyTokens(msg.sender, msg.value, amountToTransfer);
  }

  // ToDo: create a withdraw() function that lets the owner withdraw ETH
  function withdraw() public {
    uint256 ownerBalance = address(this).balance;
    require  (ownerBalance > 0, "Need balance to withdraw");

    (bool sent, ) = msg.sender.call{value: ownerBalance}("");
    require(sent, "Failed to withdraw balance");
  }

  // ToDo: create a sellTokens(uint256 _amount) function:
  function sellTokens(uint256 _amount) public {
    require(_amount > 0 , 'Amount should be greater than 0');

    uint256 userBalance = yourToken.balanceOf(msg.sender);
    require(userBalance >= _amount, "User balnce should be greater");

    uint256 ethToTransfer = _amount / tokensPerEth;
    uint256 ownerBalance = address(this).balance;
    require(ownerBalance >= ethToTransfer, 'Owner has insuffient funds to transfer');

    yourToken.transferFrom(msg.sender, address(this), _amount);

    (bool sent, ) = msg.sender.call{value: ethToTransfer}("");
    require(sent, "Failed to send ETH to the user");
  }

}

//0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
