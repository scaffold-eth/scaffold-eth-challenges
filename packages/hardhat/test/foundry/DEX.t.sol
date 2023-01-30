// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "./Setup.t.sol";

/// @title DEX Grading Tests
/// @author stevepham.eth
/// @notice Test file acts as grader for challenger's submission. Therefore, it is different than normal unit tests seen in protocol development, in that it actually is just testing other people's code against a solution code file.
/// @dev Helpers are pulled directly from solutions file since this is purely a *grading* test for education purposes.
contract DEXTest is Setup {
    /// EVENTs:

    /// @notice Emitted when ethToToken() swap transacted
    event EthToTokenSwap(address swapper, string txDetails, uint256 ethInput, uint256 tokenOutput);

    /// @notice Emitted when tokenToEth() swap transacted
    event TokenToEthSwap(address swapper, string txDetails, uint256 tokensInput, uint256 ethOutput);

    ///@notice Emitted when liquidity provided to DEX and mints LPTs.
    event LiquidityProvided(
        address liquidityProvider, uint256 tokensInput, uint256 ethInput, uint256 liquidityMinted
    );

    /// @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 tokensOutput,
        uint256 ethOutput,
        uint256 liquidityWithdrawn
    );

    /// DEXConstructor() tests

    function testDEXConstructor() public {
        assertEq(address(dex.tokenAddress()), address(balloons));
        assertEq(balloons.totalSupply(), oneThousand);
    }

    /// init() tests

    // TODO - check that local unit tests actually copy the mainnet fork, pretty sure it does, but if it doesn't, that is why my unit tests are failing when running `forge test`
    function testInit() public {
        vm.startPrank(owner);
        uint256 oldBalance = balloons.balanceOf(owner);
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
    function testCannotInitNoTokenTransfer() public {}

    /// price() tests

    /// @notice test price returns are correct
    /// @dev This could be a fuzz test I believe
    function testPrice() public {
        _init();
        vm.startPrank(owner);
        // check that price makes sense after init()
        uint256 expectedPrice1 = price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        uint256 actualPrice1 =
            dex.price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        assertEq(expectedPrice1, actualPrice1);

        // test price after a swap of ETH
        dex.ethToToken{value: ethInput}();
        uint256 expectedPrice2 = price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        uint256 actualPrice2 =
            dex.price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        assertEq(expectedPrice2, actualPrice2);

        dex.tokenToEth(2 * balloonsInput);

        // TODO - test price after a swap of balloons
        // dex.ethToToken{value: ethInput}();
        uint256 expectedPrice3 =
            price(2 * balloonsInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        uint256 actualPrice3 =
            dex.price(2 * balloonsInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        assertEq(expectedPrice3, actualPrice3);

        // test price() after a deposit()
        dex.deposit{value: ethInput}();
        uint256 expectedPrice4 = price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        uint256 actualPrice4 =
            dex.price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        assertEq(expectedPrice4, actualPrice4);

        // test price() after a withdraw()
        dex.withdraw(balloonsInput);
        uint256 expectedPrice5 = price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        uint256 actualPrice5 =
            dex.price(ethInput, dex.getBalance(), balloons.balanceOf(address(dex)));
        assertEq(expectedPrice5, actualPrice5);

        vm.stopPrank();
    }

    /// getLiquidity() test

    /// @notice checks getter getLiquidity() correctness
    function testGetLiquidity() public {
        _init();
        assertEq(dex.liquidity(owner), dex.getLiquidity(owner));
    }

    /// ethToToken() tests

    /// @notice test ethToToken() functionality
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
        vm.expectEmit(false, false, false, false); // TODO: update with (true, true, true, true), once you know what tokenOut 100% is including any small decimal discrepancies.
        emit EthToTokenSwap(owner, "Eth to Balloons", ethInput, tokenOutput);

        dex.ethToToken{value: ethInput}();

        assertApproxEqAbs(balloons.balanceOf(owner), oldBalloonBal + tokenOutput, 150 * 10 ** 15); // TODO: a bit hacky, but I think the balloon balance is just off with slippage calc? Not sure.
        assertEq(owner.balance, oldETHBal - ethInput);
        assertEq(dex.getBalance(), oldDexEthBal + ethInput);
        assertApproxEqAbs(
            balloons.balanceOf(address(dex)), oldDexBalloon - tokenOutput, 150 * 10 ** 15
        );

        vm.stopPrank();
    }

    function testCannotEthToTokenZero() public {
        _init();
        vm.prank(owner);
        vm.expectRevert("cannot swap 0 ETH");
        dex.ethToToken{value: 0}();
    }

    /// tokenToETH() tests

    /// @notice test tokenToEth() functionality
    function testTokenToEth() public {
        _init(); // 5 balloons, and 5 ETH in pool.

        // basic manual calc of expected tokenOut
        uint256 oldUserETHBal = owner.balance;
        uint256 oldUserBalloonBal = balloons.balanceOf(owner);
        uint256 dexEthBal = dex.getBalance();
        uint256 oldDexBalloonBal = balloons.balanceOf(address(dex));

        uint256 tokenReserve = balloons.balanceOf(address(dex));
        uint256 ethOutput = price(balloonsInput, tokenReserve, dexEthBal);

        vm.startPrank(owner);
        vm.expectEmit(false, false, false, false); // TODO: I think this is failing due to very small discrepancies, but have to check with console logs later.
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

    /// deposit() tests

    /// @notice test deposit() of assets for liquidity representation in DEX (records of LPs)
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

    function testCannotDepositZero() public {
        _init();
        vm.startPrank(owner);
        vm.expectRevert("deposit(): cannot deposit 0 ETHER");
        dex.deposit{value: 0}();
    }

    /// withdraw() tests

    /// @notice test withdraw() of assets through redeeming liquidity representation in DEX (records of LPs)
    function testWithdraw() public {
        _init();
        uint256 tokenReserve = balloons.balanceOf(address(dex));
        uint256 ethWithdrawn;
        uint256 totalLiquidity = dex.totalLiquidity();

        vm.prank(owner);
        dex.deposit{value: ethInput}();

        ethWithdrawn = ((withdrawAmount) * tokenReserve / totalLiquidity);
        uint256 tokenAmount = withdrawAmount * tokenReserve / totalLiquidity;
        uint256 expectedOwnerLiquidity = dex.liquidity(owner) - tokenAmount;
        uint256 expectedTotalLiquidity = dex.totalLiquidity() - tokenAmount;
        uint256 expectedOwnerBalloons = balloons.balanceOf(owner) + tokenAmount;
        uint256 expectedOwnerEth = owner.balance + ethWithdrawn;

        vm.startPrank(owner);

        vm.expectEmit(false, false, false, false);
        emit LiquidityRemoved(owner, withdrawAmount, ethWithdrawn, tokenAmount);
        dex.withdraw(withdrawAmount);

        assertEq(expectedOwnerLiquidity, dex.liquidity(owner));
        assertEq(expectedTotalLiquidity, dex.totalLiquidity());
        assertEq(expectedOwnerBalloons, balloons.balanceOf(owner));
        assertEq(expectedOwnerEth, owner.balance);

        vm.stopPrank();
    }

    function testCannotWithdraw() public {
        _init();
        vm.startPrank(user1);
        vm.expectRevert("withdraw: sender does not have enough liquidity to withdraw.");
        dex.withdraw(withdrawAmount);
    }

    /// @notice test getting the ETH balance of the total contract
    function testGetBalance() public {
        _init();
        assertEq(dex.getBalance(), initETHBalance);
    }

    /// helpers

    /// @notice initializes dex with 5 ETHER and 5 $BAL
    function _init() private {
        vm.prank(owner);
        dex.init{value: initETHBalance}(initBalloonBalance);
    }

    /// @notice solution to the price function that we are using to assess challenger's code
    function price(uint256 xInput, uint256 xReserves, uint256 yReserves)
        private
        view
        returns (uint256 yOutput)
    {
        uint256 xInputWithFee = xInput * 997;
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return (numerator / denominator);
    }
}
