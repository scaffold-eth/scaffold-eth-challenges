pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    uint256 public rate;
    Token public token;
    event TokensPurchased(address account, address token, uint256 amount);

    event TokensSold(address account, address token, uint256 amount);

    constructor(Token _token) public {
        token = _token;
    }

    function withdraw() public payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function buyTokens(uint256 _rate) public payable {
        uint256 tokenAmount = (msg.value * _rate) / 100;
        require(token.balanceOf(address(this)) >= tokenAmount);
        token.transfer(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, address(token), tokenAmount);
    }

    function sellTokens(uint256 _amount, uint256 _rate) public {
        require(token.balanceOf(msg.sender) >= _amount);
        uint256 etherAmount = (_amount * 100) / _rate;
        require(address(this).balance >= etherAmount);
        token.transferFrom(msg.sender, address(this), _amount);
        (bool sent, ) = msg.sender.call{value: etherAmount}("");
        require(sent, "Failed to send Ether");
        emit TokensSold(msg.sender, address(token), _amount);
    }
}

