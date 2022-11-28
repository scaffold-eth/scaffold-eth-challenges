// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;  //Do not change the solidity version as it negativly impacts submission grading

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {
    // contract that stores old stacked funds
    ExampleExternalContract public exampleExternalContract;
    // balance of the stacked funds
    mapping ( address => uint256 ) public balances;
    // how much they need to stake
    uint256 public constant threshold = 1 ether;
    // contract event
    event Stake(address indexed sender, uint256 amount);
    // Contract's Modifiers
    /**
    * @notice Modifier that require the deadline to be reached or not
    * @param requireReached Check if the deadline has reached or not
    */
    modifier deadlineReached( bool requireReached ) {
        uint256 timeRemaining = timeLeft();
        if( requireReached ) {
            require(timeRemaining == 0, "deadline not reached yet");
        } else {
            require(timeRemaining > 0, "deadline already reached");
        }
        _;
    }

    /**
    * @notice Modifier that require the external contract to not be completed
    */
    modifier stakeNotCompleted() {
        bool completed = exampleExternalContract.completed();
        require(!completed, "staking process already completed");
        _;
    }
    // deadline threshold
    uint256 public deadline = block.timestamp + 30 seconds;

  constructor(address exampleExternalContractAddress) {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

    function execute() public stakeNotCompleted deadlineReached(false) {
        uint256 contractBalance = address(this).balance;

        // check the contract has enough ETH to reach the threshold
        require(contractBalance >= threshold, "Threshold not reached");

        (bool sent,) = address(exampleExternalContract).call{value: contractBalance}(abi.encodeWithSignature("complete()"));
        require(sent, "exampleExternalContract.complete failed");
    }

  // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
  // ( Make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
    function stake() public payable {
        balances[msg.sender] += msg.value;
        // notify blockchain that we have staked correctly
        emit Stake(msg.sender, msg.value);
    }

  // After some `deadline` allow anyone to call an `execute()` function
  // If the deadline has passed and the threshold is met, it should call `exampleExternalContract.complete{value: address(this).balance}()`


  // If the `threshold` was not met, allow everyone to call a `withdraw()` function to withdraw their balance
    function withdraw() public deadlineReached(true) stakeNotCompleted {
        // get the balance for the user
        uint256 userBal = balances[msg.sender];

        // tell the user if they did not put any money in
        require(userBal > 0, "There is no balance to withdraw");

        // make the balance staked 0
        balances[msg.sender] = 0;

        // give the money back to user
        (bool sent,) = msg.sender.call{value: userBal}("");

        require(sent, "Failed to send user balance to user");
    }

  // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
    function timeLeft() public view returns (uint256 timeleft){
        if (block.timestamp >= deadline) {
            return 0;
        } else {
            return deadline - block.timestamp;
        }

    }

  // Add the `receive()` special function that receives eth and calls stake()

}
