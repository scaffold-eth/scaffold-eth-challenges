pragma solidity 0.8.4;  //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// learn more: https://docs.openzeppelin.com/contracts/4.x/erc20



contract YourToken is ERC20 {

    constructor() ERC20("Gold", "GLD") {
        _mint(msg.sender, 1000 * 10 ** 18);
    }
}

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
