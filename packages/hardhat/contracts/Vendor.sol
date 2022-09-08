pragma solidity 0.8.4; //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

    YourToken public yourToken;

    uint256 public constant tokensPerEth = 100;

    constructor(address tokenAddress) {
        yourToken = YourToken(tokenAddress);
    }

    // ToDo: create a payable buyTokens() function:
    function buyTokens() external payable {
        uint256 amountOfTokens = tokensPerEth * msg.value;
        //emit BuyTokens if purchase is successfull
        bool success = yourToken.transfer(msg.sender, amountOfTokens);

        if (success) {
            emit BuyTokens(msg.sender, msg.value, amountOfTokens);
        }
    }

    // ToDo: create a withdraw() function that lets the owner withdraw ETH
    function withdraw() external {
        require(
            msg.sender == 0xc16FFADf86FA0071eaeD7589FfeE56e88a076a88,
            "Only owner can withdraw ETH from vendor!"
        );
        payable(msg.sender).transfer(address(this).balance);
    }

    // ToDo: create a sellTokens(uint256 _amount) function:
}
