// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  ExampleExternalContract public exampleExternalContract;

  mapping (address => uint256) public balances;
  uint256 public constant threshold = 1 ether;
  uint256 public deadline = block.timestamp + 30 seconds;
  bool openToWithdraw = false;

  constructor(address exampleExternalContractAddress) public {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  event Stake(address _from, uint256 _value);

  modifier allowWithdraw {
    require(openToWithdraw == true);
    _;
  }

  function stake() public payable {
      balances[msg.sender] += msg.value;
      emit Stake(address(this), msg.value);
  }

  function execute() public {
    if(address(this).balance >= threshold) {
      exampleExternalContract.complete{value: address(this).balance}();
    } else {
      openToWithdraw = true;
    }
  }

  function timeLeft() public view returns (uint256) {
    if (block.timestamp >= deadline) {
      return 0;
    } else {
      return deadline - block.timestamp;
    }
  }

  function withdraw(address payable _to) public allowWithdraw {
    uint256 amount = balances[msg.sender];
    if(amount > 0) {
      balances[msg.sender] = 0;
      (bool sent,) = _to.call{value: amount}("");
      if(!sent) {
        balances[msg.sender] = amount;
      }
    }
  }

  function receive() external payable {
    this.stake();
  }
}
