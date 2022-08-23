// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Streamer is Ownable {
  event Opened(address, uint256);
  event Closing(address);
  event Liquidating(address);

  mapping(address => uint256) balances;
  mapping(address => uint256) closeAt;

  function fundChannel() public payable {
      require(balances[msg.sender] == 0, "channel already exists");

      balances[msg.sender] = msg.value;
      emit Opened(msg.sender, msg.value);
  }

  function closeChannel() public {
      require(balances[msg.sender] > 0, "no channel exists");
  
      closeAt[msg.sender] = block.timestamp + 2 minutes;
      emit Closing(msg.sender);
  }

  function timeLeft(address channel) public view returns (uint256) {
    require(closeAt[channel] != 0, "channel is not closing");
    return closeAt[channel] - block.timestamp;
  }


  function liquidateChannel() public {
    require(balances[msg.sender] > 0, "no channel exists");
    require(closeAt[msg.sender] != 0, "channel is not marked for closure");
    require(block.timestamp > closeAt[msg.sender], "not yet ready to close");

    bool sent;
    bytes memory mem;
    (sent, mem) = msg.sender.call{value: balances[msg.sender]}("");
    require(sent, "liquidation failed");
    balances[msg.sender] = 0;
    emit Liquidating(msg.sender);
  }

  function withdrawEarnings(Voucher calldata v) public onlyOwner {
    address signer = ecrecover( bytes32( v.finalBalance ), v.sig.v, v.sig.r, v.sig.s);

    uint256 payment = balances[signer] - v.finalBalance;
    owner().call{value: payment}("");
    balances[signer] = v.finalBalance;
  }

  struct Voucher {
    uint256 finalBalance;
    Signature sig;
  }
  struct Signature {
    bytes32 r;
    bytes32 s;
    uint8 v;
  }

}