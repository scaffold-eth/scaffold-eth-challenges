// SPDX-License-Identifier: WTFPL

pragma solidity ^0.6.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Monyo is ERC20 {
    constructor(address account, uint256 initialSupply) public ERC20("Monyo", "MON") {
        _mint(account, initialSupply);
    }
}
