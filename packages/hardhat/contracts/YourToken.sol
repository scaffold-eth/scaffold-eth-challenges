pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// learn more: https://docs.openzeppelin.com/contracts/3.x/erc20

contract YourToken is ERC20 {
    // ToDo: add constructor and mint tokens for deployer,
    //       you can use the above import for ERC20.sol. Read the docs ^^^

     constructor() public ERC20("Gold", "GLD") {
        // _mint() 1000 * 10 ** 18 to msg.sender
    }
}
