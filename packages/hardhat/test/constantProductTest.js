/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { solidity } = require("@nomicfoundation/hardhat-chai-matchers");

/**
 * @notice auto-grading tests for simpleDEX challenge
 * Stages of testing are as follows: set up global test variables, test contract deployment, deploy contracts in beforeEach(), then actually test out each
 * separate function.
 * @dev this is still a rough WIP. See TODO: scattered throughout.'
 * @dev additional TODO: Write edge cases; putting in zero as inputs, or whatever.
 * @dev Harshit will be producing auto-grading tests in one of the next PRs. 
 */
describe("🚩 Challenge 4: ⚖️ 🪙 Simple DEX", function () {
  this.timeout(45000);

  let dexContract;
  let balloonsContract;
  let deployer;
  let user2;
  let user3;
  let receiptDEX;
  let globalDeployReceipt;

  function getEventValue(txReceipt, eventNumber) {
    const logDescr = dexContract.interface.parseLog(
      txReceipt.logs.find(log => log.address === dexContract.address)
    );
    const args = logDescr.args;
    return args[eventNumber]; // index of ethAmount in event
  }

  async function deployNewInstance() {
    before('Deploying fresh cotract instance', async function () {
      [deployer, user2, user3] = await ethers.getSigners();
  
      const deploymentRecepit = await deployments.fixture(['Balloons', 'DEX']);

      dexContract = await ethers.getContract('DEX', deployer);
      balloonsContract = await ethers.getContract('Balloons', deployer);
      await balloonsContract.transfer( user2.address, "" + 10 * 10 ** 18 );
    });
  }

  before((done) => {
    setTimeout(done, 2000);
  });

  describe("DEX: Standard Path", function () {
    /* TODO checking `price` calcs. Preferably calculation test should be provided by somebody who didn't implement this functions in 
    challenge to not reproduce mistakes systematically. */

    // --------------------- START OF CHECKPOINT 2 ---------------------
    describe("Checkpoint 2: Reserves", function () {
      before('Deploying fresh cotract instance for testing init()', async function () {
        const { deploy } = deployments;
        const { deployer } = await getNamedAccounts();
        const chainId = await getChainId();
        
        await deploy("Balloons", { from: deployer, log: true, });
        const balloons = await ethers.getContract("Balloons", deployer);
        await deploy("DEX", {
          from: deployer,
          args: [balloons.address],
          log: true,
          waitConfirmations: 5,
        });
        dexContract = await ethers.getContract("DEX", deployer);
        await balloons.approve(dexContract.address, ethers.utils.parseEther("100"));
      });
      describe('init() function tests that referances solution.', () => {
        it("Should have the contract initialized at deployment time", async function () {
          const lpBefore = await dexContract.totalLiquidity();
          expect(lpBefore).to.equal(0);
          const txInit = await dexContract.init(ethers.utils.parseEther("5"), {
            value: ethers.utils.parseEther("5"),
            gasLimit: 200000,
          });
          const lpAfter = await dexContract.totalLiquidity();
          expect(lpAfter, "LP not minted").to.equal(ethers.utils.parseEther("5"));
          const txInitReceipt = await txInit.wait();
          const initEvent =  getEventValue(txInitReceipt, 3);
          expect(initEvent, "event not emited or the order of values in the event is different from what expected").
            to.equal(ethers.utils.parseEther("5"));
        });
      });
    });
    // ----------------- END OF CHECKPOINT 2 -----------------
    // ----------------- START OF CHECKPOINT 3 -----------------
    describe ("Checkpoint 3: Price", async () => {
      describe ("price()", async () => {
        // https://etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#readContract 
        // in Uniswap the fee is build in getAmountOut() function
        it ("Should check if prcie function calculates correctly", async function () {
          let xInput = ethers.utils.parseEther("1");
          let xReserves = ethers.utils.parseEther("5");
          let yReserves = ethers.utils.parseEther("5");
          // testing price() function
          let yOutput = await dexContract.price(xInput, xReserves, yReserves);
          expect(yOutput.toString(), "make sure to include small fee for LP providers").to.equal("831248957812239453");
          xInput = ethers.utils.parseEther("1");
          xReserves = ethers.utils.parseEther("10");
          yReserves = ethers.utils.parseEther("15");
          yOutput = await dexContract.price(xInput, xReserves, yReserves);
          expect(yOutput.toString()).to.equal("1359916340820223697");
        });
      });
    });
    // ----------------- END OF CHECKPOINT 3 -----------------
    // ----------------- START OF CHECKPOINT 4 -----------------
    describe("Checkpoint 4: Trading", function () {
      deployNewInstance();
      describe("ethToToken()", function () {
        it("Should send 1 Ether to DEX in exchange for _ $BAL", async function () {
          const dex_eth_start = await ethers.provider.getBalance(dexContract.address);
          const tx1 = await dexContract.ethToToken({value: ethers.utils.parseEther("1"),});
          // Reverts ethToToken() if the contract is not initialized
          await expect(tx1, "your functions shouldn't work without initalization").
            not.to.be.revertedWith("Contract not initialized");
          
          const tx1_receipt = await tx1.wait();
          const ethSent_1 = getEventValue(tx1_receipt, 2);

          const dex_eth_after = await ethers.provider.getBalance(dexContract.address);

          // check if the event is emited correctly
          expect(ethSent_1, "If you get this error, check the order of your emited values or your emitor is after the return in your funcion").
            to.equal(dex_eth_after.sub(dex_eth_start));

          expect(
            await ethers.provider.getBalance(dexContract.address)
          ).to.equal(ethers.utils.parseEther("6"));

        });

        it("Should revert if 0 ETH sent", async function () {
          await expect(
            dexContract.ethToToken(
                {value: ethers.utils.parseEther("0"),}
              ),
              "You should have require for reverting when sending 0 ETH to DEX").to.be.reverted;
        });

        it("Should send less tokens after the first trade (ethToToken called)", async function () {
          dexContract.connect(user2).ethToToken({
            value: ethers.utils.parseEther("1"),
          });
          
          const user2BalAfter = await balloonsContract.balanceOf(deployer.address);

          expect(dexContract.connect(user3.signer).ethToToken({ value: ethers.utils.parseEther("1"),}),
           "ethToToken() function hast to emit an event EthToTokenSwap").
              to.emit(dexContract, "EthToTokenSwap");

          const user3BalAfter = await balloonsContract.balanceOf(user2.address);
          expect(user2BalAfter).to.be.greaterThan(user3BalAfter);
        });
        it ("Should emit an event when ethToToken() called", async function () {
          await expect(dexContract.ethToToken({value: ethers.utils.parseEther("1"),})).to.emit(dexContract, "EthToTokenSwap");
        });
        it ("Should transfer tokens to purchaser after trade", async function () {
          const user3_token_before = await balloonsContract.balanceOf(user3.address);

          const tx1 = await dexContract.connect(user3).ethToToken({
            value: ethers.utils.parseEther("1"),
          });
          const tx1_receipt = await tx1.wait();
          const token_received = getEventValue(tx1_receipt, 3);

          const user3_token_after = await balloonsContract.balanceOf(user3.address);

          expect(user3_token_after, "Check if you take into account fee for the LP providers").
            to.be.equal("346747803062622811");
          expect(token_received, "Compares event from transaction to token in the user balance").
            to.equal(user3_token_after.sub(user3_token_before));
          
        });
        // could insert more tests to show the declining price, and what happens when the pool becomes very imbalanced.
      });

      describe("tokenToEth", async () => {
        it("Should send 1 $BAL to DEX in exchange for _ $ETH", async function () {
          const balloons_bal_start = await balloonsContract.balanceOf(dexContract.address);
          const dex_eth_start = await ethers.provider.getBalance(dexContract.address);

          const tx1 = await dexContract.tokenToEth(ethers.utils.parseEther("1"));
          await expect(tx1).not.to.be.revertedWith("Contract not initialized");
          // Checks that the balance of the DEX contract has decreased by 1 $BAL
          expect(await balloonsContract.balanceOf(dexContract.address)).to.equal(balloons_bal_start.add(ethers.utils.parseEther("1")));
          // Checks that the balance of the DEX contract has increased
          expect(await ethers.provider.getBalance(dexContract.address)).to.lessThan(dex_eth_start); 
        });

        it("Should revert if 0 tokens sent to the DEX", async function () {
          await expect(dexContract.tokenToEth(ethers.utils.parseEther("0"))).to.be.reverted;
        });

        it("Should emit event TokenToEthSwap when tokenToEth() called", async function () {
          await expect(dexContract.tokenToEth(ethers.utils.parseEther("1"))).to.emit(dexContract, "TokenToEthSwap");
        }); 

        it("Should send less eth after the first trade (tokenToEth() called)", async function () {
          const tx1 = await dexContract.tokenToEth(ethers.utils.parseEther("1"));
          const tx1_receipt = await tx1.wait();

          const tx2 = await dexContract.tokenToEth(ethers.utils.parseEther("1"));
          const tx2_receipt = await tx2.wait();

          const ethSent_1 =  getEventValue(tx1_receipt, 2);
          const ethSent_2 =  getEventValue(tx2_receipt, 2);
          expect(
            ethSent_2, 
            "You will get this error if your TokenToEthSwap event has ETH emited in the wrong order"
            ).below(ethSent_1);
        });
      });
    });
    // ----------------- END OF CHECKPOINT 4 -----------------
    // ----------------- START OF CHECKPOINT 5 -----------------
    describe("Checkpoint 5: Liquidity" , async () => {
      describe("deposit", async () => {
        deployNewInstance();
        it("Shoud increase liquidity in the pool when ETH is deposited", async function () {
          await balloonsContract.connect(user2).approve(dexContract.address, ethers.utils.parseEther("100"));
          const liquidity_start = await dexContract.totalLiquidity();
          expect(await dexContract.getLiquidity(user2.address)).to.equal("0");

          await expect(
            dexContract.connect(user2).deposit(( 
              ethers.utils.parseEther("5"),
              { value: ethers.utils.parseEther("5"), }
            )),
              "This error most likely come up if the order of emited events is different from the expected test: address, _tokenAmount, _ethAmount, _liquidityMinted "
            ).to.emit(dexContract, "LiquidityProvided").
                withArgs(
                  anyValue,
                  anyValue,
                  ethers.utils.parseEther("5"),
                  ethers.utils.parseEther("5")
                );
          const liquidity_end = await dexContract.totalLiquidity();
          expect(liquidity_end, "Total liquidity should increase").
            to.equal(liquidity_start.add(ethers.utils.parseEther("5")));
          user_lp = await dexContract.getLiquidity(user2.address);
          expect(user_lp.toString(), "User LP should be 5").to.equal(ethers.utils.parseEther("5"));
        });

        it("Should revert if 0 ETH deposited", async function () {
          await expect(
            dexContract.deposit(
              (ethers.utils.parseEther("0"),
                {
                  value: ethers.utils.parseEther("0"),
                }
              )
            )
          ).to.be.reverted;
        });
      });
      // pool should have 5:5 ETH:$BAL ratio
      describe("withdraw", async () => {
        deployNewInstance();
        it("Should withdraw 1 ETH and 1 $BAL when pool at 1:1 ratio", async function () {
          const totalLpBefore = await dexContract.totalLiquidity();
          const userBallonsBalance = await balloonsContract.balanceOf(deployer.address);
          // console.log("dexContract.totalLpBefore", totalLpBefore.toString());
          const tx1 = await dexContract.withdraw(ethers.utils.parseEther("1"));
          const userBallonsBalanceAfter = await balloonsContract.balanceOf(deployer.address);
          const tx1_receipt = await tx1.wait();
          const eth_out = getEventValue(tx1_receipt, 2);
          const token_out = getEventValue(tx1_receipt, 3);

          expect(userBallonsBalance, "user BAL ballance shout increase").
            to.equal(userBallonsBalanceAfter.sub(ethers.utils.parseEther("1")));
          expect(eth_out, "checks the event emtier from tx").to.be.equal(ethers.utils.parseEther("1"));
          expect(token_out, "checks the event emtier from tx").to.be.equal(ethers.utils.parseEther("1"));
        });
        
        it("Should revert if sender does not have enought liqudity", async function () {
          await expect(dexContract.withdraw(ethers.utils.parseEther("100"))).to.be.reverted;
        });

        it("Should decrease total liquidity", async function () {
          const totalLpBefore = await dexContract.totalLiquidity();
          const txWithdraw = await dexContract.withdraw(ethers.utils.parseEther("1"));
          const totalLpAfter = await dexContract.totalLiquidity();
          const txWithdraw_receipt = await txWithdraw.wait();
          const liquidityBurned = getEventValue(txWithdraw_receipt, 2);
          expect(totalLpAfter, "emiter has to show correct LP amount burned").to.be.equal(totalLpBefore.sub(liquidityBurned));
          expect(totalLpBefore, "total LP should decrease").to.be.above(totalLpAfter);
        });

        it("Should emit event LiquidityWithdrawn when withdraw() called", async function () {
          await expect(dexContract.withdraw(ethers.utils.parseEther("1.5")), 
            "Make sure you emit the LiquidityRemoved in the correct order ").
            to.emit(dexContract, "LiquidityRemoved").
              withArgs(
                deployer.address, 
                ethers.utils.parseEther("1.5"), 
                ethers.utils.parseEther("1.5"), 
                ethers.utils.parseEther("1.5")
              );
        });
      });
    });
    // ----------------- END OF CHECKPOINT 5 -----------------
  });
});
