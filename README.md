# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 0: 🎟 Simple NFT Example 🤓

🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use [👷‍♀️ HardHat](https://hardhat.org/getting-started/) to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀

🌟 The final deliverable is an app that lets users purchase and transfer NFTs. Deploy your contracts to Rinkeby and then build and upload your app to a public web server. Submit the url on [SpeedRunEthereum.com](https://speedrunethereum.com)!

💬 Meet other builders working on this challenge and get help in the [Challenge 0 telegram](https://t.me/+Y2vqXZZ_pEFhMGMx)!!!

---

# Checkpoint 0: 📦 Install 📚

Want a fresh cloud environment? Click this to open a gitpod workspace, then skip to Checkpoint 1 after the tasks are complete.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/scaffold-eth/scaffold-eth-challenges/tree/challenge-0-simple-nft)

Required: 
* [Git](https://git-scm.com/downloads)
* [Node](https://nodejs.org/dist/latest-v16.x/)  (🧨 Use Node v16 or a previous version as v17 may cause errors 🧨)
* [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

(⚠️ Don't install the linux package `yarn` make sure you install yarn with `npm i -g yarn` or even `sudo npm i -g yarn`!)

```sh
git clone https://github.com/scaffold-eth/scaffold-eth-challenges.git challenge-0-simple-nft
```
```sh
cd challenge-0-simple-nft
git checkout challenge-0-simple-nft
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```sh
cd challenge-0-simple-nft
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```sh
cd challenge-0-simple-nft
yarn deploy 
```

> You can `yarn deploy --reset` to deploy a new contract any time.

📱 Open http://localhost:3000 to see the app

---

# Checkpoint 1: ⛽️  Gas & Wallets 👛

> ⛽️ You'll need to get some funds from the faucet for gas. 

![image](https://user-images.githubusercontent.com/2653167/142483294-ff4c305c-0f5e-4099-8c7d-11c142cb688c.png)

> 🦊 At first, please **don't** connect MetaMask. If you already connected, please click **logout**:

![image](https://user-images.githubusercontent.com/2653167/142484483-1439d925-8cef-4b1a-a4b2-0f022eebc0f6.png)


> 🔥 We'll use **burner wallets** on localhost...


> 👛 Explore how **burner wallets** work in 🏗 scaffold-eth by opening a new *incognito* window and navigate it to http://localhost:3000. You'll notice it has a new wallet address in the top right. Copy the incognito browsers' address and send localhost test funds to it from your first browser: 

![image](https://user-images.githubusercontent.com/2653167/142483685-d5c6a153-da93-47fa-8caa-a425edba10c8.png)

> 👨🏻‍🚒 When you close the incognito window, the account is gone forever. Burner wallets are great for local development but you'll move to more permanent wallets when you interact with public networks.

---

# Checkpoint 2: 🖨 Minting 

> ✏️ Mint some NFTs!  Click the `MINT NFT` button in the YourCollectables tab.  

![MintNFT](https://user-images.githubusercontent.com/12072395/145692116-bebcb514-e4f0-4492-bd10-11e658abaf75.PNG)


👀 You should see your collectibles start to show up:

![nft3](https://user-images.githubusercontent.com/526558/124386983-48965300-dcb3-11eb-88a7-e88ad6307976.png)

👛 Open an **incognito** window and navigate to http://localhost:3000 

🎟 Transfer an NFT to the incognito window address using the UI:

![nft5](https://user-images.githubusercontent.com/526558/124387008-58ae3280-dcb3-11eb-920d-07b6118f1ab2.png)

👛 Try to mint an NFT from the incognito window. 

> Can you mint an NFT with no funds in this address?  You might need to grab funds from the faucet to pay the gas!

🕵🏻‍♂️ Inspect the `Debug Contracts` tab to figure out what address is the `owner` of `YourCollectible`?

🔏 You can also check out your smart contract `YourCollectible.sol` in `packages/hardhat/contracts`.

💼 Take a quick look at your deploy script `00_deploy_your_contract.js` in `packages/hardhat/deploy`.

📝 If you want to make frontend edits, open `App.jsx` in `packages/react-app/src`.

---

# Checkpoint 3: 💾 Deploy it! 🛰

🛰 Ready to deploy to a public testnet?!?

> Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js` to `rinkeby`

![networkSelect](https://user-images.githubusercontent.com/12072395/146871168-29b3d87a-7d25-4972-9b3c-0ec8c979171b.PNG)

🔐 Generate a **deployer address** with `yarn run generate`

![nft7](https://user-images.githubusercontent.com/526558/124387064-7d0a0f00-dcb3-11eb-9d0c-195f93547fb9.png)

👛 View your **deployer address** using `yarn account` 

![nft8](https://user-images.githubusercontent.com/526558/124387068-8004ff80-dcb3-11eb-9d0f-43fba2b3b791.png)

⛽️ Use a faucet like [faucet.paradigm.xyz](https://faucet.paradigm.xyz/) or [rinkebyfaucet.com](https://www.rinkebyfaucet.com/) to fund your **deployer address**.

> ⚔️ **Side Quest:** Keep a 🧑‍🎤 [punkwallet.io](https://punkwallet.io/) on your phone's home screen and keep it loaded with testnet eth. 🧙‍♂️ You'll look like a wizard when you can fund your **deployer address** from your phone in seconds. 

🚀 Deploy your NFT smart contract:

```sh
yarn deploy
```

> 💬 Hint: You can set the `defaultNetwork` in `hardhat.config.js` to `Rinkeby` OR you can `yarn deploy --network rinkeby`. 

---

# Checkpoint 4: 🚢 Ship it! 🚁

> ✏️ Edit your frontend `App.jsx` in `packages/react-app/src` to change the `targetNetwork` to `NETWORKS.rinkeby`:

![image](https://user-images.githubusercontent.com/2653167/142491593-a032ebf2-38c7-4d1c-a4c5-5e02485e21b4.png)

You should see the correct network in the frontend (http://localhost:3000):

![nft10](https://user-images.githubusercontent.com/526558/124387099-9a3edd80-dcb3-11eb-9a57-54a7d370589a.png)

🎫 Ready to mint a batch of NFTs for reals?  Use the `MINT NFT` button.

![MintNFT2](https://user-images.githubusercontent.com/12072395/145692572-d61c971d-7452-4218-9c66-d675bb78a9dc.PNG)


📦 Build your frontend:

```sh
yarn build
```

💽 Upload your app to surge:
```sh
yarn surge
```
(You could also `yarn s3` or maybe even `yarn ipfs`?)

>  😬 Windows users beware!  You may have to change the surge code in `packages/react-app/package.json` to just `"surge": "surge ./build",`

⚙ If you get a permissions error `yarn surge` again until you get a unique URL, or customize it in the command line. 

⚠️ Run the automated testing function to make sure your app passes

```sh
yarn test
```
![testOutput](https://user-images.githubusercontent.com/12072395/152587433-8314f0f1-5612-44ae-bedb-4b3292976a9f.PNG)

---

# Checkpoint 5: 📜 Contract Verification

Update the `api-key` in `packages/hardhat/package.json` file. You can get your key [here](https://etherscan.io/myapikey).

![Screen Shot 2021-11-30 at 10 21 01 AM](https://user-images.githubusercontent.com/9419140/144075208-c50b70aa-345f-4e36-81d6-becaa5f74857.png)

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

# Checkpoint 6: 💪 Flex!

👩‍❤️‍👨 Share your public url with a friend and ask them for their address to send them a collectible :)

![nft15](https://user-images.githubusercontent.com/526558/124387205-00c3fb80-dcb4-11eb-9e2f-29585e323037.gif)

---

# ⚔️ Side Quests

## 🐟 Open Sea
> Add your contract to OpenSea
> 1. hover over your profile photo in the top right and navigate to `Collections` or go to `https://opensea.io/collections`
> ![my_collections](https://user-images.githubusercontent.com/46639943/150223014-92a2e32d-d2a2-4fd4-ac3b-bd2d0fcb5840.png)
> 2. click the vertical elipsis and select `Import an existing smart contract`
> ![import_contract](https://user-images.githubusercontent.com/46639943/150225448-815a17c1-4ea6-4663-8aff-8f757bebbb54.png)
> 3. select `Live on a testnet`
> ![live_on_testnet](https://user-images.githubusercontent.com/46639943/150229334-038100bb-22e0-4240-a293-c2b88adc1219.png)
> 4. be sure you're on the same network you deployed to and enter your contract address!
> ![contract_address](https://user-images.githubusercontent.com/46639943/150229361-e50e8c57-3918-450f-8bee-29cf42d65b52.png)


(It can take a while before they show up, but here is an example:)
https://testnets.opensea.io/assets/0xc2839329166d3d004aaedb94dde4173651babccf/1

## 🔶 Infura
> You will need to get a key from infura.io and paste it into constants.js in packages/react-app/src:

![nft13](https://user-images.githubusercontent.com/526558/124387174-d83c0180-dcb3-11eb-989e-d58ba15d26db.png)

---

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Meet other builders working on this challenge in the [Challenge 0 telegram channel](https://t.me/+Y2vqXZZ_pEFhMGMx)!!!

> 👉 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
