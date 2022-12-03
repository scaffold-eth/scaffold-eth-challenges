// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { DEX } from "../../contracts/ADDRESS_VAR.sol"; // TODO - see github issue trying to put env vars into a foundry test dynamically
import { Balloons } from "../../contracts/Balloons.sol";

abstract contract Setup is Test {
    
    DEX public dex;
    Balloons public balloons;
   
    // TODO: check curve-sandbox repo and get the users there cause forge should just have a ton of ETH in dummy users. That's what we want to use. Should be able to delete these users or replace them after figuring that out.

    address public owner = 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045; // NOTE - vitalik.eth for tests but we may need a different address to supply USDC depending on our tests
    address public user1 = address(1);
    address public user2 = address(2);
    address public dummyAddress = address(3);

    uint256 public constant five = 5 * 10 ** 18;
    uint256 public constant oneHundred = 100 * 10 ** 18;
    uint256 public constant oneThousand = 1000 * 10 ** 18;

    uint256 public constant initBalloonBalance = 5 * 10 ** 18; // as per deployment script challengers should be using. 
    uint256 public constant initETHBalance = 5 * 10 ** 18; // as per deployment script challengers should be using. 
    uint256 public constant ethInput = 10 ** 18;
    uint256 public constant balloonsInput = 10 ** 18;
    uint256 public constant withdrawAmount = balloonsInput / 2;

    uint256 public constant PRICE_PRECISION = 10 ** 18;

    constructor() {
        vm.startPrank(owner); // NOTE: TODO: don't need to make it an owner, but perhaps we want to test them on using Ownable.sol as well.
        balloons = new Balloons();
        dex = new DEX(address(balloons));
        balloons.transfer(user1, oneHundred); 
        
        // init DEX with 5 Ether and 5 Balloons
        
        balloons.approve(address(dex),oneThousand);
        vm.stopPrank();
        vm.prank(user1);
        balloons.approve(address(dex),oneThousand);
        vm.prank(user2);
        balloons.approve(address(dex),oneThousand);
    }

}