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
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Allows vendor to buyback tokens from owner
    function sellTokens(uint256 _amount) external payable {
        //validate token amount
        require(_amount > 0, "Must sell token amount greater than 0");

        //validate the seller has the tokens to sell
        address seller = msg.sender;
        uint256 sellerBalance = yourToken.balanceOf(seller);
        require(
            sellerBalance >= _amount,
            "Seller doesnt have enough tokens to sell"
        );

        //validate the vendor has enough eth
        uint256 amountOfEth = _amount / tokensPerEth;
        uint256 sellerEthBalance = address(this).balance;
        require(
            sellerEthBalance >= amountOfEth,
            "Seller doesnt have enough ETH"
        );

        //transfer tokens
        bool sent = yourToken.transferFrom(msg.sender, address(this), _amount);
        require(sent, "Failed to transfer tokens");
        //transfer eth
        (bool ethSent, ) = msg.sender.call{value: amountOfEth}("");
        require(ethSent, "Failed to send back eth");
    }
}
