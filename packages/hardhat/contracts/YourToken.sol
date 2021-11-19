pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// learn more: https://docs.openzeppelin.com/contracts/3.x/erc20

contract Token is ERC20 {
    //ToDo: add constructor and mint tokens for deployer,
    //you can use the above import for ERC20.sol. Read the docs ^^^
     constructor(uint256 initialSupply) public ERC20("BogiDog", "BODO") {
        _mint(msg.sender,  1000 * 10 ** 18);
    }
}
