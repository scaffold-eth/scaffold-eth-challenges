// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DEX} from "../../contracts/DEX.sol"; // TODO - see github issue trying to put env vars into a foundry test dynamically
import {Balloons} from "../../contracts/Balloons.sol";

abstract contract Setup is Test {
    DEX public dex;
    Balloons public balloons;

    address public owner = 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045; // NOTE - vitalik.eth
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
        vm.deal(owner, 1000 ether);
        vm.startPrank(owner); // NOTE: TODO: don't need to make it an owner, but perhaps we want to test them on using Ownable.sol as well.
        balloons = new Balloons();

        // TODO - instantiate where the DEX code is coming from... how is this done in JS?
        dex = new DEX(address(balloons));
        balloons.transfer(user1, oneHundred);

        // init DEX with 5 Ether and 5 Balloons

        balloons.approve(address(dex), oneThousand);
        vm.stopPrank();
        vm.prank(user1);
        balloons.approve(address(dex), oneThousand);
        vm.prank(user2);
        balloons.approve(address(dex), oneThousand);
    }
}
