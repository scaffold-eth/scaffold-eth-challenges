# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 0: 🎟 Simple NFT Example 🤓

🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use [👷‍♀️ HardHat](https://hardhat.org/getting-started/) to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀

🏆 The final deliverable is an app that lets users purchase and transfer NFTs. Deploy your contracts to Rinkeby and then build and upload your app to a public web server. Share the url in the Challenge 0 telegram channel!!!

---

# Checkpoint 0: 📦 Install 📚


Required: 
* [Git](https://git-scm.com/downloads)
* [Node](https://nodejs.org/dist/latest-v12.x/)
* [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

(⚠️ Don't install the linux package `yarn` make sure you install yarn with `npm i -g yarn`)

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

> ✏️ Edit the script `mint.js` in `packages/hardhat/scripts` and update the `toAddress` to your frontend address (in the top right of http://localhost:3000).

![nft1](https://user-images.githubusercontent.com/526558/124386962-37e5dd00-dcb3-11eb-911e-0afce760d7ee.png)

> in a terminal window run the mint script:

```sh
yarn mint
```
![nft2](https://user-images.githubusercontent.com/526558/124386972-3d432780-dcb3-11eb-933e-dad7dfd313b2.png)

👀 You should see your collectibles show up if you minted to the correct address:

![nft3](https://user-images.githubusercontent.com/526558/124386983-48965300-dcb3-11eb-88a7-e88ad6307976.png)

👛 Open an **incognito** window and navigate to http://localhost:3000 

🎟 Transfer an NFT to the incognito window address using the UI:

![nft5](https://user-images.githubusercontent.com/526558/124387008-58ae3280-dcb3-11eb-920d-07b6118f1ab2.png)

🕵🏻‍♂️ Inspect the `Debug Contracts` tab to figure out what address is the `owner` of `YourCollectible`?

🔏 You can also check out your smart contract `YourCollectible.sol` in `packages/hardhat/contracts`.

💼 Take a quick look at your deploy script `00_deploy_your_contract.js` in `packages/hardhat/deploy`.

📝 If you want to make frontend edits, open `App.jsx` in `packages/react-app/src`.

---

# Checkpoint 3: 💾 Deploy it! 🛰

🛰 Ready to deploy to a public testnet?!?

> Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js` to `NETWORKS.rinkeby`

![image](https://user-images.githubusercontent.com/2653167/142488032-fd3bd75f-34d0-46fc-be63-5d66e09174e6.png)

🔐 Generate a **deployer address** with `yarn generate`

![nft7](https://user-images.githubusercontent.com/526558/124387064-7d0a0f00-dcb3-11eb-9d0c-195f93547fb9.png)

👛 View your **deployer address** using `yarn account` 

![nft8](https://user-images.githubusercontent.com/526558/124387068-8004ff80-dcb3-11eb-9d0f-43fba2b3b791.png)

⛽️ Use a faucet like [faucet.paradigm.xyz](https://faucet.paradigm.xyz/) to fund your **deployer address**.

> ⚔️ **Side Quest:** Keep a 🧑‍🎤 [punkwallet.io](punkwallet.io) on your phone's home screen and keep it loaded with testnet eth. 🧙‍♂️ You'll look like a wizard when you can fund your **deployer address** from your phone in seconds. 

🚀 Deploy your NFT smart contract:

```sh
yarn deploy
```

> 💬 Hint: You can set the `defaultNetwork` in `hardhat.config.js` to `Rinkeby` OR you can `yarn deploy --network Rinkeby`. 

---

# Checkpoint 4: 🚢 Ship it! 🚁

> ✏️ Edit your frontend `App.jsx` in `packages/react-app/src` to change the `targetNetwork` to `NETWORKS.rinkeby`:

![image](https://user-images.githubusercontent.com/2653167/142491593-a032ebf2-38c7-4d1c-a4c5-5e02485e21b4.png)

You should see the correct network in the frontend (http://localhost:3000):

![nft10](https://user-images.githubusercontent.com/526558/124387099-9a3edd80-dcb3-11eb-9a57-54a7d370589a.png)

🎫 Ready to mint a batch of NFTs for reals?

```sh
yarn mint
```

![nft11](https://user-images.githubusercontent.com/526558/124387132-b04c9e00-dcb3-11eb-95d1-03b8c272e52f.png)



📦 Build your frontend:

```sh
yarn build
```

💽 Upload your app to surge:
```sh
yarn surge
```
(You could also `yarn s3` or maybe even `yarn ipfs`?)


---

# Checkpoint 5: 💪 Flex!

> 🎖 Show off your app by pasting the surge url in the [Challenge 0 telegram channel](https://t.me/joinchat/Y2vqXZZ_pEFhMGMx)

---

👩‍❤️‍👨 Share your public url with a friend and ask them for their address to send them a collectible :)

![nft15](https://user-images.githubusercontent.com/526558/124387205-00c3fb80-dcb4-11eb-9e2f-29585e323037.gif)

---

# ⚔️ Side Quests

## 🐟 Open Sea
> Add your contract to OpenSea ( create -> submit NFTs -> "or add an existing contract")

(It can take a while before they show up, but here is an example:)
https://testnets.opensea.io/assets/0xc2839329166d3d004aaedb94dde4173651babccf/1
## 🔍 Etherscan Contract Verification
> run yarn flatten > flat.txt (You will need to clean up extra junk at the top and bottom of flat.txt. Sorry, rookie stuff here.)

> copy the contents of flat.txt to the block explorer and select compiler v0.6.7 and Yes to Optimization (200 runs if anyone asks)

![nft12](https://user-images.githubusercontent.com/526558/124387153-c8bcb880-dcb3-11eb-8191-e53f87129b88.png)

## 🔶 Infura
> You will need to get a key from infura.io and paste it into constants.js in packages/react-app/src:

![nft13](https://user-images.githubusercontent.com/526558/124387174-d83c0180-dcb3-11eb-989e-d58ba15d26db.png)

---

> 🏰 Buidl Guidl Discord Server [Join Here](https://discord.gg/ZnFs36fbbU)

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
