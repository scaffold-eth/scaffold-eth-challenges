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
        _init(); // 5 balloons, and 5 ETH in pool.
        
        // basic manual calc that should be in challenger contract of expected tokenOut
        uint256 oldETHBal = owner.balance;
        uint256 oldBalloonBal = balloons.balanceOf(owner);
        uint256 oldDexBalloon = balloons.balanceOf(address(dex));
        uint256 oldDexEthBal = dex.getBalance();
        uint256 token_reserve = balloons.balanceOf(address(dex));
        uint256 tokenOutput = price(ethInput, oldDexEthBal, token_reserve);
        
        vm.startPrank(owner);
        vm.expectEmit(false, false, false, false); // TODO: update with (true, true, true, true), once you know what tokenOu is.
        emit EthToTokenSwap(owner, "Eth to Balloons", ethInput, tokenOutput);

        dex.ethToToken{value: ethInput}();

        assertApproxEqAbs(balloons.balanceOf(owner), oldBalloonBal + tokenOutput, 150 * 10 ** 15); // TODO: a bit hacky, but I think the balloon balance is just off with slippage calc? Not sure.
        assertEq(owner.balance, oldETHBal - ethInput);
        assertEq(dex.getBalance(), oldDexEthBal + ethInput);
        assertApproxEqAbs(balloons.balanceOf(address(dex)), oldDexBalloon - tokenOutput, 150 * 10 ** 15);

        vm.stopPrank();
    }

    function testCannotEthToTokenZero() public {
        _init();
        vm.prank(owner);
        vm.expectRevert("cannot swap 0 ETH");
        dex.ethToToken{value: 0}();
    }

    function testTokenToEth() public {
        _init(); // 5 balloons, and 5 ETH in pool.
        
        // basic manual calc of expected tokenOut
        uint256 calcEthOut; // TODO: get some help on this, cause you code late at night lol and are too tired to think on this.
        uint256 oldUserETHBal = owner.balance;
        uint256 oldUserBalloonBal = balloons.balanceOf(owner);
        // uint256 oldDexBalloon = balloons.balanceOf(address(dex));
        uint256 dexEthBal = dex.getBalance();
        uint256 oldDexBalloonBal = balloons.balanceOf(address(dex));

        uint256 tokenReserve = balloons.balanceOf(address(dex));
        uint256 ethOutput = price(balloonsInput, tokenReserve, dexEthBal);

        vm.startPrank(owner);
        vm.expectEmit(false, false, false, false); // TODO: update with (true, true, true, true), once you know what calcTokenOut is.
        emit TokenToEthSwap(owner, "Balloons to ETH", balloonsInput, ethOutput);
        dex.tokenToEth(balloonsInput);

        assertEq(oldDexBalloonBal + balloonsInput, balloons.balanceOf(address(dex)));
        assertEq(balloons.balanceOf(owner), oldUserBalloonBal - balloonsInput);
        assertEq(oldUserETHBal + ethOutput, owner.balance);
        assertEq(dexEthBal - ethOutput, dex.getBalance());

        vm.stopPrank();
    }

    function testCannotTokenToETHZero() public {
        _init();
        vm.prank(owner);
        vm.expectRevert("cannot swap 0 tokens");
        dex.tokenToEth(0);
    }

    function testDeposit() public {
        _init();
        uint256 ethReserve = dex.getBalance();
        uint256 tokenReserve = balloons.balanceOf(address(dex));
        uint256 tokenDeposit;
        uint256 oldOwnerETH = owner.balance;

        tokenDeposit = ((ethInput * tokenReserve) / ethReserve) + 1;
        uint256 liquidityMinted = ethInput * dex.totalLiquidity() / ethReserve;
        uint256 expectedOwnerLiquidity = dex.liquidity(owner) + liquidityMinted;
        uint256 expectedTotalLiquidity = dex.totalLiquidity() + liquidityMinted;

        vm.startPrank(owner);
        vm.expectEmit(false, false, false, false);
        emit LiquidityProvided(owner, liquidityMinted, ethInput, tokenDeposit);
        dex.deposit{value: ethInput}();

        assertEq(dex.liquidity(owner), expectedOwnerLiquidity);
        assertEq(owner.balance, oldOwnerETH - ethInput);
        assertEq(expectedTotalLiquidity, dex.totalLiquidity());
        vm.stopPrank();
    }


    // TODO: need to write still
    function testWithdraw() public {
        _init();
        vm.startPrank(owner);
        vm.stopPrank();
    }

    function testGetBalance() public {
        _init();
        assertEq(dex.getBalance(), initETHBalance);
    }
    
    // helpers

    function _init() private {
        vm.prank(owner);
        dex.init{value: initETHBalance}(initBalloonBalance); 
    }

    /// @notice solution to the price function that we are using to assess challenger's code
    function price(
        uint256 xInput,
        uint256 xReserves,
        uint256 yReserves
    ) private view returns (uint256 yOutput) {
        uint256 xInputWithFee = xInput * 997;
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return (numerator / denominator);
    }

    // TODO: deposit helper for testWithdraw()
    
}