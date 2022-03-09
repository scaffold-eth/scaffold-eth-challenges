# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 2: 🏵 Token Vendor 🤖


> 🤖 Smart contracts are kind of like "always on" *vending machines* that **anyone** can access. Let's make a decentralized, digital currency. Then, let's build an unstoppable vending machine that will buy and sell the currency. We'll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.  

> 🏵 Create `YourToken.sol` smart contract that inherits the **ERC20** token standard from OpenZeppelin. Set your token to `_mint()` **1000** (\* 10 \*\* 18) tokens to the `msg.sender`. Then create a `Vendor.sol` contract that sells your token using a payable `buyTokens()` function.

> 🎛 Edit the frontend that invites the user to `<input\>` an amount of tokens they want to buy. We'll display a preview of the amount of ETH (or USD) it will cost with a confirm button.

> 🔍 It will be important to verify your token's source code in the block explorer after you deploy. Supporters will want to be sure that it has a fixed supply and you can't just mint more.

> 🌟 The final deliverable is an app that lets users purchase your ERC20 token, transfer it, and sell it back to the vendor. Deploy your contracts on your public chain of choice and then `yarn build` and `yarn surge` your app to a public web server. Submit the url on [SpeedRunEthereum.com](https://speedrunethereum.com)!

> 💬 Meet other builders working on this challenge and get help in the [Challenge 2 telegram](https://t.me/joinchat/IfARhZFc5bfPwpjq)!

🧫 Everything starts by ✏️ Editing `YourToken.sol` in `packages/hardhat/contracts`

---

### Checkpoint 0: 📦 install 📚

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-challenges challenge-2-token-vendor
cd challenge-2-token-vendor
git checkout challenge-2-token-vendor
yarn install
```

🔏 Edit your smart contract `YourToken.sol` in `packages/hardhat/contracts`

---

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

`yarn chain` (hardhat backend)

`yarn start` (react app frontend)

`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)

> 👀 Visit your frontend at http://localhost:3000

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.

> ignore any warnings, we'll get to that...

---

### Checkpoint 2: 🏵Your Token 💵

> 👩‍💻 Edit `YourToken.sol` to inherit the **ERC20** token standard from OpenZeppelin

> Mint **1000** (\* 10 \*\* 18) to your frontend address using the `constructor()`.

(Your frontend address is the address in the top right of http://localhost:3000)

> You can `yarn deploy --reset` to deploy your contract until you get it right.

#### 🥅 Goals

- [ ] Can you check the `balanceOf()` your frontend address in the **YourToken** of the `Debug Contracts` tab?
- [ ] Can you `transfer()` your token to another account and check _that_ account's `balanceOf`?

(Use an incognito window to create a new address and try sending to that new address. Use the `transfer()` function in the `Debug Contracts` tab.)

---

### Checkpoint 3: ⚖️ Vendor 🤖

> 👩‍💻 Edit the `Vendor.sol` contract with a **payable** `buyTokens()` function

Use a price variable named `tokensPerEth` set to **100**:

```solidity
uint256 public constant tokensPerEth = 100;
```

> 📝 The `buyTokens()` function in `Vendor.sol` should use `msg.value` and `tokensPerEth` to calculate an amount of tokens to `yourToken.transfer()` to `msg.sender`.

> 📟 Emit **event** `BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens)` when tokens are purchased.

Edit `deploy/01_deploy_vendor.js` to deploy the `Vendor` (uncomment Vendor deploy lines).

#### 🥅 Goals

- [ ] When you try to buy tokens from the vendor, you should get an error: **'ERC20: transfer amount exceeds balance'**

⚠️ this is because the Vendor contract doesn't have any YourTokens yet!

⚔️ Side Quest: send tokens from your frontend address to the Vendor contract address and *then* try to buy them.

> ✏️ We can't hard code the vendor address like we did above when deploying to the network because we won't know the vender address at the time we create the token contract. 

> ✏️ So instead, edit `YourToken.sol` to transfer the tokens to the `msg.sender` (deployer) in the **constructor()**.

> ✏️ Then, edit `deploy/01_deploy_vendor.js` to transfer 1000 tokens to `vendor.address`.

```js
await yourToken.transfer( vendor.address, ethers.utils.parseEther("1000") );
```

> You can `yarn deploy --reset` to deploy your contract until you get it right.

(You will use the `YourToken` UI tab and the frontend for most of your testing. Most of the UI is already built for you for this challenge.)

#### 🥅 Goals

- [ ] Does the `Vendor` address start with a `balanceOf` **1000** in `YourToken` on the `Debug Contracts` tab?
- [ ] Can you buy **10** tokens for **0.1** ETH?
- [ ] Can you transfer tokens to a different account?


> 📝 Edit `Vendor.sol` to inherit *Ownable*.

In `deploy/01_deploy_vendor.js` you will need to call `transferOwnership()` on the `Vendor` to make *your frontend address* the `owner`:

```js
await vendor.transferOwnership("**YOUR FRONTEND ADDRESS**");
```

#### 🥅 Goals

- [ ] Is your frontend address the `owner` of the `Vendor`?

> 📝 Finally, add a `withdraw()` function in `Vendor.sol` that lets the owner withdraw ETH from the vendor.

#### 🥅 Goals

- [ ] Can **only** the `owner` withdraw the ETH from the `Vendor`?

#### ⚔️ Side Quests

- [ ] Can _anyone_ withdraw? Test _everything_!
- [ ] What if you minted **2000** and only sent **1000** to the `Vendor`?

---

### Checkpoint 4: 🤔 Vendor Buyback 🤯

👩‍🏫 The hardest part of this challenge is to build your `Vendor` to buy the tokens back.

🧐 The reason why this is hard is the `approve()` pattern in ERC20s. You can read more about the `approve()` pattern [here](https://docs.ethhub.io/guides/a-straightforward-guide-erc20-tokens/).

😕 First, the user has to call `approve()` on the `YourToken` contract, approving the `Vendor` contract address to take some amount of tokens.

🤨 Then, the user makes a *second transaction* to the `Vendor` contract to `sellTokens(uint256 amount)`.

🤓 The `Vendor` should call `yourToken.transferFrom(msg.sender, address(this), theAmount)` and if the user has approved the `Vendor` correctly, tokens should transfer to the `Vendor` and ETH should be sent to the user.

> 📝 Edit `Vendor.sol` and add a `sellTokens()` function!

⚠️ You will need extra UI for calling `approve()` before calling `sellTokens(uint256 amount)`.

🔨 Use the `Debug Contracts` tab to call the approve and sellTokens() at first but then...

🔍 Look in the `App.jsx` for the extra approve/sell UI to uncomment!

#### 🥅 Goal

- [ ] Can you sell tokens back to the vendor?
- [ ] Do you receive the right amount of ETH for the tokens?

#### ⚔️ Side Quest

- [ ] Should we disable the `owner` withdraw to keep liquidity in the `Vendor`?
- [ ] It would be a good idea to display Sell Token Events.  Create the `event` and `emit` it in your `Vendor.sol` and look at `buyTokensEvents` in your `App.jsx` for an example of how to update your frontend.

#### ⚠️ Test it!
-  Now is a good time to run `yarn test` to run the automated testing function. It will test that you hit the core checkpoints.  You are looking for all green checkmarks and passing tests!

----

### Checkpoint 5: 💾 Deploy it! 🛰

📡 Edit the `defaultNetwork` in `packages/hardhat/hardhat.config.js`, as well as `targetNetwork` in `packages/react-app/src/App.jsx`, to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/)

👩‍🚀 You will want to run `yarn account` to see if you have a **deployer address**.

🔐 If you don't have one, run `yarn generate` to create a mnemonic and save it locally for deploying.

🛰 Use a faucet like [faucet.paradigm.xyz](https://faucet.paradigm.xyz/) to fund your **deployer address** (run `yarn account` again to view balances)

> 🚀 Run `yarn deploy` to deploy to your public network of choice (😅 wherever you can get ⛽️ gas)

🔬 Inspect the block explorer for the network you deployed to... make sure your contract is there.

---
### Checkpoint 6: 🚢 Ship it! 🚁

📦 Run `yarn build` to package up your frontend.

💽 Upload your app to surge with `yarn surge` (you could also `yarn s3` or maybe even `yarn ipfs`?)

>  😬 Windows users beware!  You may have to change the surge code in `packages/react-app/package.json` to just `"surge": "surge ./build",`

⚙ If you get a permissions error `yarn surge` again until you get a unique URL, or customize it in the command line.

🚔 Traffic to your url might break the [Infura](https://infura.io/) rate limit, edit your key: `constants.js` in `packages/ract-app/src`.

---
### Checkpoint 7: 📜 Contract Verification

Update the `api-key` in `packages/hardhat/package.json`. You can get your key [here](https://etherscan.io/myapikey).

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

👀 You may see an address for both YouToken and Vendor.  You will want the Vendor address.

👉 This will be the URL you submit to 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com).

---

💬 Problems, questions, comments on the stack? Post them to the [Challenge 2 telegram channel](https://t.me/joinchat/IfARhZFc5bfPwpjq)
