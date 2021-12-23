# 🏗 Scaffold-ETH | 🏰 BuidlGuidl

## 🚩 Challenge 4: Oracles 🔮, Price Feeds 🤑 and VRF 🎲

---
## Checkpoint 0: 📦 Install 📚

Prerequisites: 
- [Node](https://nodejs.org/en/download/) 
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Git](https://git-scm.com/downloads)

>(⚠️ Don't install the linux package `yarn` make sure you install yarn with `npm i -g yarn`)

> clone/fork [🏗 challenge repository](https://github.com/scaffold-eth/scaffold-eth-challenges)

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-challenges.git challenge-4-oracle
```

> install and start your 👷‍ Hardhat chain:

```bash
cd challenge-4-oracle
git checkout challenge-4-oracle
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd challenge-4-oracle
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd challenge-4-oracle
yarn deploy
```

📱 Open http://localhost:3000 to see the app

---

### Checkpoint 1: ⛽️  Gas & Wallets 👛

> ⛽️ You'll need to get some funds from the faucet for gas. 

![image](https://user-images.githubusercontent.com/2653167/142483294-ff4c305c-0f5e-4099-8c7d-11c142cb688c.png)

> 🦊 At first, please **don't** connect MetaMask. If you already connected, please click **logout**:

![image](https://user-images.githubusercontent.com/2653167/142484483-1439d925-8cef-4b1a-a4b2-0f022eebc0f6.png)

> 🔥 We'll use **burner wallets** on localhost...

> 👛 Explore how **burner wallets** work in 🏗 scaffold-eth by opening a new *incognito* window and navigate it to http://localhost:3000. You'll notice it has a new wallet address in the top right. Copy the incognito browsers' address and send localhost test funds to it from your first browser: 

![image](https://user-images.githubusercontent.com/2653167/142483685-d5c6a153-da93-47fa-8caa-a425edba10c8.png)

> 👨🏻‍🚒 When you close the incognito window, the account is gone forever. Burner wallets are great for local development but you'll move to more permanent wallets when you interact with public networks.
---
### Checkpoint 2: Adding a new Chainlink🧊 price feed 💸




---
### Checkpoint 3: Using randomness 🎲



---
### Checkpoint 4: Deploy 🛰

>🛰 Ready to deploy your contracts to kovan testnet? (we use kovan due to all the Chainlink contracts on kovan)

```bash
yarn deploy --network kovan
```

#### Verify Your Contract(s)

> update your api-key in the package.json file

![Screen Shot 2021-11-30 at 8 46 22 AM](https://user-images.githubusercontent.com/9419140/144058738-e4fe7446-1cd0-4a16-b6bd-f3c6562738b2.png)

```bash
yarn verify --network YOUR_NETWORK
```

### Checkpoint 5: Ship 🚚
> 🚚 Ready to ship your dapp

```bash
yarn surge --domain mydomain.surge.sh

```

---
### 💬 Support & Chat

🏰  Buidl Guidl Discord Server Join [Here](https://discord.gg/ZnFs36fbbU)

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
