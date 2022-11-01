# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 9: A State Channel Application

> 🐌 The Ethereum blockchain has great decentralization & security properties. These properties come at a price: transaction throughput is low, and transactions can be expensive (search term: blockchain trilemma). This makes many traditional web applications infeasible on a blockchain... or does it?

> 🍰 A number of approaches to scaling have been developed, collectively referred to as layer-2s (L2s). Among them is the concept of payment channels, state channels, and state channel networks. This tutorial walks through the creation of a simple state channel application, where users seeking a service **lock** collateral on-chain with a single transaction, **interact** with their service provider entirely off-chain, and **finalize** the interaction with a second on-chain transaction.

> 🧑‍🤝‍🧑 State channels really excel as a scaling solution in cases where a fixed set of participants want to exchange value-for-service at high frequency. The canonical example is in file sharing or media streaming: the server exchanges chunks of a file in exchange for micropayments.

> 🧙 In our case, the service provider is a `Guru` who provides off-the-cuff wisdom to each client `Rube` through a one-way chat box. Each character of text that is delivered is expected to be compensated with a payment of `0.001 ETH`.

> 📖 Read more about state channels in the [Ethereum Docs.](https://ethereum.org/en/developers/docs/scaling/state-channels/)

> ❗ [OpenZepplin's ECDSA Library](https://docs.openzeppelin.com/contracts/2.x/api/cryptography#ECDSA) provides an easy way to verify signed messages, but for this challenge we'll write the code ourselves.

We will:

- 🛣️ Build a `Streamer.sol` contract that collects **ETH** from numerous client addresses using a payable `fundChannel()` function and keeps track of `balances`.
- 💵 Exchange paid services off-chain between the `Streamer.sol` contract owner (the **Guru**) and **rube** clients with funded channels. The **Guru** provides the service in exchange for signed vouchers which can later be redeemed on-chain.
- ⏱ Create a Challenge mechanism with a timeout, so that **rubes** are protected from a **Guru** who goes offline while funds are locked on-chain (either by accident, or as a theft attempt).
- ⁉ Consider some security / usability holes in the current design.

> 💬 Meet other builders working on this challenge and get help in the [State Channel Telegram](https://t.me/+k0eUYngV2H0zYWUx)!

---

### Checkpoint 0: 📦 install 📚

```bash

git clone https://github.com/scaffold-eth/scaffold-eth-challenges.git challenge-9-state-channels

cd challenge-9-state-channels

git checkout challenge-9-state-channels

yarn install

```

Files that we'll be editing in this tutorial are:

- `00_deploy_streamer.js` in `packages/hardhat/deploy`
- `Streamer.sol` in `packages/hardhat/contracts`
- `App.jsx` in `packages/react-app/src`

> 🔍 **Tip**: entry points for each of the checkpoints that involve writing code can be located by searching these files for `Checkpoint N` (for whatever `N` value)

---

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

```bash
yarn chain   (hardhat backend)
yarn start   (react app frontend)
yarn deploy  (to compile, deploy, and publish your contracts to the frontend)
```

> 💻 View your frontend at http://localhost:3000/

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.

---

### Checkpoint 2: Configure Deployment & Wallets

Like the [token vendor challenge](https://speedrunethereum.com/challenge/token-vendor), we'll be building an `Ownable` contract. The contract owner is the **Guru** - the service provider in this application, and you will use multiple browser windows or tabs to assume the roles of Guru and rube (service provider & client).

> 👁 `contract Streamer` inherits `Ownable` with the `is` keyword. `Ownable` comes from [openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) - a collection of high quality smart contract library code.

> 📝 In `packages/hardhat/deploy/00_deploy_streamer.js`, uncomment the lines of code that deploy the contract and transfer ownership.  You will need to enter your own front end address.

You'll have to redeploy with `yarn deploy --reset`.

We'll need another active address to act as the rube in our app. To do this,

- Open `localhost:3000` in a new tab / window of the current browser
- Click the wallet icon (top right) to open the wallet
- `private key` -> `generate` will reload the page under a new address

The wallet icon now lets you move between accounts. Eventually you'll probably want a few wallets & windows open simultaneously.

(**Note**: previous challenges created new addresses by opening an incognito window or a different browser. This will **not** work for this challenge, because the off-chain application uses a very simple communication pipe that doesn't work between different browsers or private windows.)

#### 🥅 Goals

- [ ] Does your original frontend address recieve the `Hello Guru` UI?
- [ ] Does your alternate addresses recieve the `Hello Rube` UI?

---

### Checkpoint 3: Fund a Channel

Like the [decentralized staking challenge](https://speedrunethereum.com/challenge/decentralized-staking), we'll track balances for individual channels / users in a mapping:

```
mapping (address => uint256) balances;
```

Rubes seeking wisdom will use a **payable** `fundChannel()` function, which will update this mapping with the supplied balance.

> 📝 Edit Streamer.sol to complete the `fundChannel()` function

> 👁 Check App.jsx to see the frontend hook for this function. (ctrl-f fundChannel)

#### 🥅 Goals:

- [ ] Does opening a channel (from Rube's tab, you may need some funds from the faucet) cause a `Recieved Wisdom` box to appear?
- [ ] Do opened channels appear on the Guru's UI as well?
- [ ] Using the _Debug Contracts_ tab, does a repeated call to `fundChannel` fail?

---

### Checkpoint 4: Exchange the Service

Now that the channel is funded, and all participants have observed the funding via the emitted event, we can begin our off-chain exchange of service. We are now working in `packages/react-app/src/App.jsx`.

Functions of note:

- `provideService`: The Guru sends wisdom over the wire to the client.
- `reimburseService`: The rube creates a voucher for the recieved service, signs it, and returns it.
- `processVoucher`: The service provider recieves and stores vouchers.

The first two functions are complete - we will work on `processVoucher`, where the service provider examines returned payments, confirms their authenticity, and stores them.

> 📝 Edit App.jsx to complete the `processVoucher()` function and secure this off-chain exchange. You'll need to recreate the encoded message that the client has signed, and then verify that the received signature was in fact produced by the client on that same data.

#### 🥅 Goals:

- [ ] Secure your service! Validate the incoming voucher & signature according to instructions inside `processVoucher(v)`
- [ ] With an open channel, start sending advice. Can you see the claimable balance update as service is rendered?

#### ⚔️ Side Quest:

- [ ] Can `provideService` be modified to prevent continued service to clients who don't keep up with their payments? (_hint_: you'll want to compare the size of your best voucher against the size of your provided wisdom. If there's too big a discrepency, cut them off!)

### Checkpoint 5: Recover Service Provider's Earnings

Now that we've collected some vouchers, we'd like to redeem them on-chain and move funds from the `Streamer` contract's `balances` map to the Guru's own address. The `withdrawEarnings` function of `Streamer.sol` takes a Struct named voucher (balance + signature) as input, and should:

- Recover the signer using `ecrecover(bytes32, uint8, bytes32, bytes32)` on the `prefixedHashed` message and supplied signature.
  - _Hint_: `ecrecover` takes the signature in its decomposed form with `v,`,`r`, and`s` values. The string signature produced in `App.jsx` is just a concatenation of these values, which we split using `ethers.utils.splitSignature` to create the on-chain friendly signature. Read about the [ecrecover function here](https://docs.soliditylang.org/en/v0.8.17/units-and-global-variables.html)
- Check that the signer has a running channel with balance greater than the voucher's `updatedBalance`
- Calculate the payout (`balances[signer] - updatedBalance`)
- Update the channel balance.
- Pay the contract owner.

Reminders:

- Changes to contracts must be redeployed to the local chain with `yarn deploy --reset`.
- For troubleshooting / debugging, your contract can use hardhat's `console.log`, which will print to your console running the chain.

> 📝 Edit Streamer.sol to complete the `withdrawEarnings()` function as described.

> 📝 Edit App.jsx to enable the UI button for withdrawals.

#### 🥅 Goals:

- [ ] Recover funds on-chain for services rendered! After the Guru submits a voucher to chain, you should be able to see the wallet's ETH balance increase.

#### ⚔️ Side Quest:

- [ ] `withdrawEarnings` is a function that only the service provider would be interested in calling. Should it be marked `onlyOwner`? (the `onlyOwner` modifier makes a function accessible only to the contract owner - anyone else who tries to call it will be immediately rejected).

### Checkpoint 6: Challenge & Close the Channel

So far so good:

- Rubes can connect to the Guru via an on-chain deposit.
- The pair can then transact off-chain with high throughput.
- The Guru can recover earnings with their received vouchers.

But what if a rube is unimpressed with the service and wishes to close a channel to recover whatever funds remain? What if the Guru is a no-show after the initial channel funding deposit?

A payment channel is a cryptoeconomic protocol - care needs to be taken so that everyone's financial interests are protected. We'll implement a two step **challenge** and **close** mechanism that allows rubes to recover unspent funds, while keeping the Guru's earnings safe.

> 📝 Edit Streamer.sol to create a public `challengeChannel()` function.

> 📝 Edit App.jsx to enable the challenge and closure buttons for service clients(rubes).

The `challengeChannel()` function should:

- Check in the `balances` map that a channel is already open in the name of `msg.sender`
- Declare this channel to be closing by setting `canCloseAt[msg.sender]` to `block.timestamp + 30 seconds`
- Emit a `Challenged` event with the sender's address.

The emitted event gives notice to the Guru that the channel will soon be emptied, so they should apply whatever vouchers they have before the timeout period ends.

> 📝 Edit Streamer.sol to create a public `defundChannel()` function.

The `defundChannel()` function should:

- Check that `msg.sender` has a closed channel, by ensuring a non-zero `canCloseAt[msg.sender]` is before the current timestamp.
- Transfer `balances[msg.sender]` to the sender.
- Emit a `Closed` event.

#### 🥅 Goals:

- [ ] Launch a challenge as a channel client. The Guru's UI should show an alert via their `Cash out latest voucher` button.
- [ ] Recover the Guru's best voucher before the channel closes.
- [ ] Close the channel and recover rube funds.

#### ⚔️ Side Quests:

- [ ] Currently, the service provider has to manually submit their vouchers after a challenge is registered on chain. Should their channel wallet do that automatically? Can you implement that in this application?
- [ ] Suppose some rube enjoyed their first round of advice. Is it safe for them to open a new channel with `Streamer.sol`? (_Hint_: what data does the Guru still hold?)

#### ⚠️ Test it!

- Now is a good time to run `yarn test` to run the automated testing function. It will test that you hit the core checkpoints. You are looking for all green checkmarks and passing tests!

---

### Checkpoint 5: 🚢 Ship it 🚁

📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/hardhat/hardhat.config.js`

👩‍🚀 You will want to run `yarn account` to see if you have a **deployer address**

🔐 If you don't have one, run `yarn generate` to create a mnemonic and save it locally for deploying.

⛽️ You will need to send ETH to your **deployer address** with your wallet.

> 🚀 Run `yarn deploy` to deploy your smart contract to a public network (selected in hardhat.config.js)

---

### Checkpoint 6: 🎚 Frontend 🧘‍♀️

> 📝 Edit the `targetNetwork` in `App.jsx` (in `packages/react-app/src`) to be the public network where you deployed your smart contract.

📡 When you are ready to ship the frontend app...

📦 Run `yarn build` to package up your frontend.

💽 Upload your app to surge with `yarn surge` (you could also `yarn s3` or maybe even `yarn ipfs`?)

> 😬 Windows users beware! You may have to change the surge code in `packages/react-app/package.json` to just `"surge": "surge ./build",`

⚙ If you get a permissions error `yarn surge` again until you get a unique URL, or customize it in the command line.

🚔 Traffic to your url might break the [Infura](https://infura.io/) rate limit, edit your key: `constants.js` in `packages/ract-app/src`.

---

### Checkpoint 7: 📜 Contract Verification

Update the api-key in packages/hardhat/package.json file. You can get your key [here](https://etherscan.io/myapikey).

![Screen Shot 2021-11-30 at 10 21 01 AM](https://user-images.githubusercontent.com/9419140/144075208-c50b70aa-345f-4e36-81d6-becaa5f74857.png)

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
