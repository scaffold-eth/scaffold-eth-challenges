pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  event Stake(address, uint256);

  ExampleExternalContract public exampleExternalContract;
  mapping (address => uint256) public balances;
  uint256 public constant threshold = 1 ether;
  uint256 public deadline = block.timestamp + 30 seconds;
  bool public openForWithdraw;

  modifier notCompleted() {
    require(!exampleExternalContract.completed(), "The stake is already completed");
    _;
  }

  constructor(address exampleExternalContractAddress) public {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
  //  ( make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
  function stake() public payable {
    balances[msg.sender] += msg.value;
    emit Stake(msg.sender, msg.value);
  }

  // After some `deadline` allow anyone to call an `execute()` function
  function execute() public notCompleted {
    if (block.timestamp >= deadline) {
      if (address(this).balance >= threshold) {
        // It should either call `exampleExternalContract.complete{value: address(this).balance}()` to send all the value
        exampleExternalContract.complete{value: address(this).balance}();
      } else {
        // if the `threshold` was not met, allow everyone to call a `withdraw()` function
        openForWithdraw = true;
      }
    }
  }

  // Add a `withdraw(address payable)` function lets users withdraw their balance
  function withdraw(address payable to) public payable notCompleted {
    if (openForWithdraw) {
      to.transfer(balances[msg.sender]);
    }
  }

  // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
  function timeLeft() public view returns (uint256) {
    if (block.timestamp >= deadline) {
      return 0;
    }
    return deadline - block.timestamp;
  }


  // Add the `receive()` special function that receives eth and calls stake()
  receive() external payable {
    stake();
  }
}
