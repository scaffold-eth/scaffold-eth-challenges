# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge N: A state channel application

> 🐌 The Ethereum blockchain has great decentralization & security properties. These properties come at a price: transaction throughput is low, and transactions can be expensive (search term: blockchain trilemma). This makes many traditional web applications infeasible on a blockchain... or does it?

> 🍰 A number of approaches to scaling have been developed, collectively referred to as layer-2s (L2s). Among them is the concept of payment channels, state channels, and state channel networks. This tutorial walks through the creation of a simple state channel application, where users seeking a service **lock** collatoral on-chain with a single transaction, **interact** with their service provider entirely off-chain, and **finalize** the interaction with a second on-chain transaction. We will:

- 🛣️ Build a `Streamer.sol` contract that collects **ETH** from numerous client addresses using a payable `fundChannel()` function and keeps track of `balances`.
- 💵 Exchange paid services off-chain between the `Streamer.sol` contract owner and clients with funded channels. The **Streamer** provides the service in exchange for signed vouchers which can later be redeemed on-chain.
- ⏱ Create a Challenge mechanism, so that clients are protected from a service provider who goes offline while funds are locked on-chain (either by accident, or as a theft attempt).
- ⁉ Consider some security / usability holes in the current design.

// todo

> 🌟 The final deliverable is deploying a Dapp that lets users send ether to a contract and stake if the conditions are met, then `yarn build` and `yarn surge` your app to a public webserver. Submit the url on [SpeedRunEthereum.com](https://speedrunethereum.com)!

// todo

> 💬 Meet other builders working on this challenge and get help in the [Challenge 1 telegram](https://t.me/joinchat/E6r91UFt4oMJlt01)!

---

### Checkpoint 0: 📦 install 📚

```bash

git clone https://github.com/statechannels/speedrun-statechannels.git challenge-N-statechannels

cd challenge-N-statechannels

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
yarn start   (react app frontend)
yarn chain   (hardhat backend)
yarn deploy  (to compile, deploy, and publish your contracts to the frontend)
```

> ⚠️ Note: `yarn deploy` will report an unexpected error. We will fix this in Checkpoint 2 and redeploy.

> 💻 View your frontend at http://localhost:3000/

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.

---

### Checkpoint 2: Configure Deployment & Wallets

Like the [token vendor challenge](https://speedrunethereum.com/challenge/token-vendor), we'll be building an `Ownable` contract. The contract owner will be the service provider in this application, and you will use multiple browsers or tabs to assume the roles of server and client.

> 👁 `contract Streamer` inherits `Ownable` with the `is` keyword. `Ownable` comes from [openzeppelin-contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) - a collection of high quality smart contract library code.

> In `packages/hardhat/deploy/00_deploy_streamer.js`, supply an address from your frontend wallet to the `streamer.transferOwnership()` function.

You'll have to redeploy with `yarn deploy --reset`.

We'll need another active address to act as the client in our app. To do this,

- open `localhost:3000` in a new tab / window of the current browser
- click the wallet icon (top right) to open the wallet
- `private key` -> `generate` will reload the page under a new address

The wallet icon now lets you move between accounts. Eventually you'll probably want a few wallets & windows open simultaneously.

(**Note**: previous challenges created alt addresses by opening the page with a private window or a different browser. This will **not** work for this challenge, because the off-chain application uses a very simple communication pipe that doesn't work between different browsers or private windows.)

#### 🥅 Goals

- [ ] does your original frontend address recieve the `Hello Guru` UI?
- [ ] do your alternate addresses recieve the `Hello Rube` UI?

---

### Checkpoint 3: Fund a channel

Like the [decentralized staking challenge](https://speedrunethereum.com/challenge/decentralized-staking), we'll track balances for individual channels / users in a mapping:

```
mapping (address => uint256) balances;
```

Clients opening a channel will use a **payable** `fundChannel()` function, which will update this mapping with the supplied balance.

> 📝 Edit Streamer.sol to complete the `fundChannel()` function

> 👓 Check App.jsx to see the frontend hook for this function. (ctrl-f fundChannel)

#### 🥅 Goals:

- [ ] does opening a channel cause a `Recieved Wisdom` box to appear?
- [ ] do opened channels appear on the contract owner's UI as well?
- [ ] using the _Debug UI_ tab, does a repeated call to `fundChannel` fail?

---

### Checkpoint 4: Exchange the Service

Now that the channel is funded, and all participants have observed the funding via the emitted event, we can begin our off-chain exchange of service. State channels really excel as a scaling solution in cases where a fixed set of participants want to exchange value-for-service at high frequency. The canonical example is in file sharing or media streaming: the server exchanges chunks of a file in exchange for micropayments.

In our case, the service provider will provide off-the-cuff wisdom to each client through a one-way chat box. Each character of text that is delivered is expected to be compensated with a payment of `0.001 ETH`. The exchange of service is entirely off chain, so we are now working in `packages/react-app/src/App.jsx`.

Functions of note:

- `provideService`: the service provider sends wisdom over the wire to the client
- `reimburseService`: the client creates a voucher for the recieved service, signs it, and returns it
- `processVoucher`: the service provider recieves and stores vouchers

The first two are complete - we will work on `processVoucher`, where the service provider examines returned payments, confirms their authenticity, and stores them.

> 📝 Edit App.jsx to complete the `processVoucher()` function and secure this off-chain exchange. You'll need to recreate the encoded message that the client has signed, and then verify that the received signature was in fact produced by the client on that same data.

#### 🥅 Goals:

- [ ] secure your service! Validate the incoming voucher & signature according to instructions inside `processVoucher(v)`
- [ ] with an open channel, check the console in the Guru's tab. Can you see the claimable balance updates as service is rendered?

#### ⚔️ Side Quest:

- [ ] can `provideService` be modified to prevent continued service to deadbeat clients?

### Checkpoint 5: Recover Service Provider's Earnings

Now that we've collected some vouchers, we'd like to redeem them on-chain in order to move funds from the contract's `balances` map to the contract owner. The `withdrawEarnings` function of `Streamer.sol` takes a voucher (balance + signature) as input, and should:

- recover the signer using `ecrecover()` on the `prefixedHashed` message and supplied signature
- check that the signer has a running channel with balance greater than the voucher's `updatedBalance`
- calculate the payout (`balances[signer] - updatedBalance`)
- update the channel balance
- pay the contract owner

Reminders:

- changes to contracts must be redeployed to the local chain with `yarn deploy --reset`.
- for troubleshooting / debugging, your contract can use hardhat's `console.log`, which will print to your console running the chain

> 📝 Edit Streamer.sol to complete the `withdrawEarnings()` function as described

> 📝 Edit App.jsx to enable the UI button for withdrawals

#### 🥅 Goals:

- [ ] Recover funds on-chain for services rendered! After the guru submits a voucher to chain, you should be able to see the wallet's ETH balance increase.

#### ⚔️ Side Quest:

- [ ] `withdrawEarnings` is a function that only the service provider would be interested in calling. Should it be marked `onlyOwner`?

### Checkpoint 6: Challenge & Close the channel

So far so good. The service provider and client can connect via the on-chain deposit, exchange service for value off-chain, and the service provider can recover earnings with their received vouchers.

But what if the client is unimpressed with the service, and wishes to close a channel and recover whatever funds remain? What if the service provider is a no-show after the initial channel funding deposit?

A payment channel is a cryptoeconomic protocol - care needs to be taken so that everyone's financial interests are protected. We'll implement a two step **challenge** and **close** mechanism that allows clients to recover funds, while keeping the service provider's earnings safe.

> 📝 Edit Streamer.sol to create a public `challengeChannel()` function

> 📝 Edit App.jsx to enable the challenge and closure buttons for service clients

The `challengeChannel()` function should:

- check in the `balances` map that a channel is already open in the name of `msg.sender`
- declare this channel to be closing by setting `closeAt[msg.sender]` to `block.timestamp + 30 seconds`
- emit a `Challenged` event with the sender's address

The emitted event gives notice to the service provider the channel will soon be emptied, so they should apply whatever vouchers they have before the timeout period ends.

> 📝 Edit Streamer.sol to create a public `closeChannel()` function

The `closeChannel()` function should:

- check that `msg.sender` has a closed channel, by ensuring a non-zero `closeAt[msg.sender]` is lower than the current timestamp
- transfer `balances[msg.sender]` to the sender
- emit a `Closed` event

#### 🥅 Goals:

- [ ] Launch a challenge as a channel client. The guru's UI should show an alert via their `Cash out latest voucher` button.
- [ ] Recover the guru's best voucher before the channel closes.
- [ ] Close the channel and recover client funds.

#### ⚔️ Side Quest:

- [ ] Currently, the service provider has to manually submit their vouchers after a challenge is registered on chain. Should their channel wallet do that automatically? Can you implement that in this application?
- [ ] Suppose some client enjoyed their first round of advice. Is it safe for them to open a new channel under `Streamer.sol`? (hint: what data does the guru still hold?)

#### ⚠️ Test it!

// todo: write tests

- Now is a good time to run `yarn test` to run the automated testing function. It will test that you hit the core checkpoints. You are looking for all green checkmarks and passing tests!

---

### Checkpoint 5: 🚢 Ship it 🚁

📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/hardhat/hardhat.config.js`

👩‍🚀 You will want to run `yarn account` to see if you have a **deployer address**

🔐 If you don't have one, run `yarn generate` to create a mnemonic and save it locally for deploying.

⛽️ You will need to send ETH to your **deployer address** with your wallet.

> 📝 If you plan on submitting this challenge, be sure to set your `deadline` to at least `block.timestamp + 72 hours`

> 🚀 Run `yarn deploy` to deploy your smart contract to a public network (selected in hardhat.config.js)

---

### Checkpoint 6: 🎚 Frontend 🧘‍♀️

> 📝 Edit the `targetNetwork` in `App.jsx` (in `packages/react-app/src`) to be the public network where you deployed your smart contract.

> 💻 View your frontend at http://localhost:3000/

📡 When you are ready to ship the frontend app...

📦 Run `yarn build` to package up your frontend.

💽 Upload your app to surge with `yarn surge` (you could also `yarn s3` or maybe even `yarn ipfs`?)

> 😬 Windows users beware! You may have to change the surge code in `packages/react-app/package.json` to just `"surge": "surge ./build",`

⚙ If you get a permissions error `yarn surge` again until you get a unique URL, or customize it in the command line.

> 📝 you will use this deploy URL to submit to [SpeedRunEthereum.com](https://speedrunethereum.com).

🚔 Traffic to your url might break the [Infura](https://infura.io/) rate limit, edit your key: `constants.js` in `packages/ract-app/src`.

---

### Checkpoint 7: 📜 Contract Verification

Update the api-key in packages/hardhat/package.json file. You can get your key [here](https://etherscan.io/myapikey).

![Screen Shot 2021-11-30 at 10 21 01 AM](https://user-images.githubusercontent.com/9419140/144075208-c50b70aa-345f-4e36-81d6-becaa5f74857.png)

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
