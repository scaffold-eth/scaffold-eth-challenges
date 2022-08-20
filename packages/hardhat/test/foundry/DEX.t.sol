// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./Setup.t.sol";

contract DEXTest is Setup {    
    
    /// EVENTs:
    
    /// @notice Emitted when ethToToken() swap transacted
    event EthToTokenSwap(address swapper, string txDetails, uint256 ethInput, uint256 tokenOutput);

    /// @notice Emitted when tokenToEth() swap transacted
    event TokenToEthSwap(address swapper, string txDetails, uint256 tokensInput, uint256 ethOutput);

    ///@notice Emitted when liquidity provided to DEX and mints LPTs.
    event LiquidityProvided(address liquidityProvider, uint256 tokensInput, uint256 ethInput, uint256 liquidityMinted);

    /// @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 tokensOutput,
        uint256 ethOutput,
        uint256 liquidityWithdrawn
    );

    /// Main DEX Functional Tests

    /// DEXConstructor() tests

    function testDEXConstructor() public {
        assertEq(address(dex.tokenAddress()), address(balloons));
        assertEq(balloons.totalSupply(), oneThousand);
    }

    function testInit() public {
        vm.startPrank(owner);
        uint256 oldBalance = balloons.balanceOf(owner);
        uint256 userOldETHBalance = owner.balance;
        console.log("user eth balance: %s", userOldETHBalance);
        console.log("user balloon balance: %s", oldBalance);
        console.log("dex eth balance: %s", dex.getBalance());
        dex.init{value: initETHBalance}(initBalloonBalance); 
        assertEq(dex.totalLiquidity(), initBalloonBalance);
        assertEq(dex.liquidity(owner), initBalloonBalance);
        assertEq(balloons.balanceOf(owner), oldBalance - initBalloonBalance);
        assertEq(dex.getBalance(), initETHBalance); 
        vm.stopPrank();
    }

    function testCannotInitTwice() public {
        _init();
        vm.startPrank(user1);
        vm.expectRevert("DEX: init - already has liquidity");
        dex.init(initBalloonBalance);
        vm.stopPrank();
    }

    // TODO: remove reversion statement from challenge actually because ERC20 has a revert already if transferFrom() fails. See my TODO in DEX.sol
    function testCannotInitNoTokenTransfer() public {
    }

    function testPrice() public {
        // test we get the right price back
        // test with basic xInput, xReserves, yReserves at init?
        // This could be a fuzz test I guess
    }

    function testGetLiquidity() public {
        _init();
        assertEq(dex.liquidity(owner), dex.getLiquidity(owner));
    }

    function testEthToToken() public {
    }
    
    // helpers

    function _init() private {
        vm.prank(owner);
        dex.init{value: initETHBalance}(initBalloonBalance); 
    }
    
}