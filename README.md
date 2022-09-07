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

🧫 Everything starts by ✏️ Editing `Streamer.sol` in `packages/hardhat/contracts`

---

### Checkpoint 0: 📦 install 📚

Want a fresh cloud environment? Click this to open a gitpod workspace, then skip to Checkpoint 1 after the tasks are complete.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/scaffold-eth/scaffold-eth-challenges/tree/challenge-1-decentralized-staking) // todo

```bash

git clone https://github.com/statechannels/speedrun-statechannels.git challenge-N-statechannels

cd challenge-N-statechannels

yarn install

```

🔏 Edit your smart contract `Streamer.sol` in `packages/hardhat/contracts`

---

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

```bash
yarn start   (react app frontend)
yarn chain   (hardhat backend)
yarn deploy  (to compile, deploy, and publish your contracts to the frontend)
```

> 💻 View your frontend at http://localhost:3000/

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.

---

### Checkpoint 2: Configure Deployment & Wallets

Like the [token vendor challenge](https://speedrunethereum.com/challenge/token-vendor), we'll be building an `Ownable` contract. The contract owner will be the service provider in this application, and you will use multiple browsers or tabs to assume the roles of server and client.

> 📝 Edit Streamer.sol to inherit `Ownable`. (TIP: Openzeppelin )

> In `packages/hardhat/deploy/00_deploy_streamer.js`, supply an address from your frontend wallet to the `streamer.transferOwnership()` function.

You'll have to redeploy with `yarn deploy --reset`.

We'll need another active to act as the client in our app. There are a few ways to go about this. Either:

1. open `localhost:3000` with a different browser
2. open `localhost:3000` in a private window
3. open `localhost:3000` in a separate tab / window of your current browser, click the wallet icon (top right) to open up the wallet, then `private key` > `generate` will reload the page from a new account.

`1` and `2` are quicker, but `3` gives a little more flexibility with respect to running the app with several clients at once.

#### 🥅 Goals

- [ ] does your original frontend address recieve the `Hello Guru` UI?
- [ ] do your alternate addresses recieve the `Hello Rube` UI?


---

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
