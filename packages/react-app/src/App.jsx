import WalletConnectProvider from "@walletconnect/web3-provider";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import { Alert, Button, Card, Checkbox, Col, Menu, Row, List, Space, Spin } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Address, Balance, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserAddress,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
// import Hints from "./Hints";
import { ExampleUI, Hints, Subgraph } from "./views";

import { useContractConfig } from "./hooks";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import humanizeDuration from "humanize-duration";
import TextArea from "antd/lib/input/TextArea";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    // torus: {
    //   package: Torus,
    //   options: {
    //     networkParams: {
    //       host: "https://localhost:8545", // optional
    //       chainId: 1337, // optional
    //       networkId: 1337 // optional
    //     },
    //     config: {
    //       buildEnv: "development" // optional
    //     },
    //   },
    // },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

/**
 * let the application pay for your received wisdom automatically.
 * if false, the client will have to manually trigger each payment.
 */
let autoPay = true;

function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const contractConfig = useContractConfig();

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  //
  // statechannel specific listeners, application, etc.
  //

  // ** 📟 Listen for on-chain channel events
  const openEvents = useEventListener(readContracts, "Streamer", "Opened", localProvider, 1);
  console.log("open events:", openEvents);
  const challengeEvents = useEventListener(readContracts, "Streamer", "Challenged", localProvider, 1);
  console.log("close events:", challengeEvents);
  const closeEvents = useEventListener(readContracts, "Streamer", "Closed", localProvider, 1);

  function onchainChannels() {
    let opened = [];
    openEvents.forEach(chan => {
      opened.push(chan.args[0]); // see the Opened event in Streamer.sol
    });

    let challenged = [];
    challengeEvents.forEach(chan => {
      challenged.push(chan.args[0]); // see Challenged event in Streamer.sol
    });

    const closed = [];
    closeEvents.forEach(chan => {
      closed.push(chan.args[0]); // see Closed event in Streamer.sol

      // remove finalized channels from the list of running channels
      opened = opened.filter(addr => addr != chan.args[0]);
      // removed finalized channels from list of open challenges
      challenged = challenged.filter(addr => addr != chan.args[0]);
    });

    return {
      opened,
      challenged,
      closed,
    };
  }

  const chainChannels = onchainChannels();
  console.log(`chanStat:\n${JSON.stringify(chainChannels)}`);

  const timeLeft = useContractReader(readContracts, "Streamer", "timeLeft", [address]);
  console.log("timeleft: " + timeLeft);

  const userAddress = useUserAddress(userSigner);
  const ownerAddress = useContractReader(readContracts, "Streamer", "owner");
  console.log("User:  %s\nOwner: %s", userAddress, ownerAddress);

  const userIsOwner = ownerAddress == userAddress;

  if (onchainChannels().challenged.length === 0) {
    // turn off the noisy interval mining if there are
    // no expected challenge channels after this tx
    try {
      localProvider.send("evm_setIntervalMining", [0]);
    } catch (e) {}
  }

  /*
    The off-chain app:
    ==================
    - The provider sends wisdom through the channel, the client returns signed 
        vouchers which the provider can redeem at their convenience
    - The client pays per character. This type of transaction throughput is infeasible on L1 because of:
      - gas costs per transaction dwarfing the cost of each transaction
      - block-time constraints preventing real-time p2p payments
  */

  /*
    Client perspective:
    - clients participate in a single channel - the client-streamer channel.    
  */

  /*
    The channel used to communicate application state and payment updates off chain.
  */
  const channel = getUserChannel();

  /**
   * to prevent repeated instantiations on react rerenders
   * @returns {BroadcastChannel}
   */
  function getUserChannel() {
    if (window.userChannel === undefined || window.userChannel.name === "") {
      window.userChannel = new BroadcastChannel(userAddress);
    }

    return window.userChannel;
  }


  
  //This is the wisdome the client is paying for. It'd better be good.
  let recievedWisdom = "";

  /**
   * Handle incoming service data from the service provider.
   *
   * If autoPay is turned on, instantly recalculate due payment
   * and return to the service provider.
   *
   * @param {MessageEvent<string>} e
   */
  channel.onmessage = e => {
    if (typeof e.data != "string") {
      console.warn(`recieved unexpected channel data: ${JSON.stringify(e.data)}`);
      return;
    }

    console.log("Received: %s", e.data);
    recievedWisdom = e.data;
    document.getElementById("recievedWisdom-" + userAddress).innerText = recievedWisdom;

    if (autoPay) {
      reimburseService(recievedWisdom);
    }
  };

  function hasOpenChannel() {
    return onchainChannels().opened.includes(userAddress);
  }

  function hasClosingChannel() {
    return onchainChannels().challenged.includes(userAddress);
  }

  function hasClosedChannel() {
    return onchainChannels().closed.includes(userAddress);
  }

  /**
   * reimburseService prepares, signs, and delivers a voucher for the service provider
   * that pays for the recieved wisdom.
   *
   * @param {string} wisdom
   */
  async function reimburseService(wisdom) {
    const initialBalance = ethers.utils.parseEther("0.5");
    const costPerCharacter = ethers.utils.parseEther("0.001");
    const duePayment = costPerCharacter.mul(ethers.BigNumber.from(wisdom.length));

    let updatedBalance = initialBalance.sub(duePayment);

    if (updatedBalance.lt(ethers.BigNumber.from(0))) {
      updatedBalance = ethers.BigNumber.from(0);
    }

    const packed = ethers.utils.solidityPack(["uint256"], [updatedBalance]);
    const hashed = ethers.utils.keccak256(packed);
    const arrayified = ethers.utils.arrayify(hashed);

    // Why not just sign the updatedBalance string directly?
    //
    // Two considerations:
    // 1) This signature is going to verified both off-chain (by the service provider)
    //    and on-chain (by the Streamer contract). These are distinct runtime environments, so
    //    care needs to be taken that signatures are applied to specific data encodings.
    //
    //    the arrayify call below encodes this data in an EVM compatible way
    //
    //    see: https://blog.ricmoo.com/verifying-messages-in-solidity-50a94f82b2ca for some
    //         more on EVM verification of messages signed off-chain
    // 2) Because of (1), it's useful to apply signatures to the hash of any given message
    //    rather than to arbitrary messages themselves. This way the encoding strategy for
    //    the fixed-length hash can be reused for any message format.

    const signature = await userSigner.signMessage(arrayified);

    channel.postMessage({
      updatedBalance: updatedBalance.toHexString(),
      signature,
    });
  }

  /*
    Streamer perspective:
    - streamer has a channel per client
    - streamer types advice into each client's text-box, and can monitor
  */

  /*
    an {address: BroadcastChannel} map. One channel for each subscribed channel.
  */
  const channels = {};

  /*
    an {address: Voucher} that stores the highest paying voucher for each client.
  */

  /**
   * @returns { {[x: string]: {updatedBalance: ethers.BigNumber, signature: string}} }
   */
  function vouchers() {
    if (window.vouchers === undefined) {
      window.vouchers = {};
    }
    return window.vouchers;
  }

  chainChannels.opened.forEach(clientAddress => {
    setClientChannel(channels, clientAddress);
    channels[clientAddress] = window.clientChannels[clientAddress];
  });

  // attach a voucher handler for each client
  if (userIsOwner) {
    Object.keys(channels).forEach(clientAddress => {
      channels[clientAddress].onmessage = recieveVoucher(clientAddress);
    });
  }

  /**
   * wraps a voucher processing function for each client.
   */
  function recieveVoucher(clientAddress) {
    return processVoucher;

    /**
     * Handle incoming payments from the given client.
     *
     * @param {MessageEvent<{updatedBalance: string, signature: string}>} voucher
     */
    function processVoucher(voucher) {
      // recreate a BigNumber object from the message. v.data.updatedBalance is
      // a string representation of the BigNumber for transit over the network
      const updatedBalance = ethers.BigNumber.from(voucher.data.updatedBalance);

      /*
       *  Checkpoint 4:
       *
       *  currently, this function recieves and stores vouchers uncritically.
       *
       *  recreate the packed, hashed, and arrayified message from reimburseService (above),
       *  and then use ethers.utils.verifyMessage() to confirm that voucher signer was
       *  `clientAddress`. (If it wasn't, log some error message and return).
      */

      const existingVoucher = vouchers()[clientAddress];

      // update our stored voucher if this new one is more valuable
      if (existingVoucher === undefined || updatedBalance.lt(existingVoucher.updatedBalance)) {
        vouchers()[clientAddress] = voucher.data;
        vouchers()[clientAddress].updatedBalance = updatedBalance;
        updateClaimable(clientAddress);
        // logVouchers();
      }
    }
  }

  /**
   * @param {string} clientAddress
   */
  function updateClaimable(clientAddress) {
    if (vouchers()[clientAddress] === undefined) {
      return;
    }

    const init = ethers.utils.parseEther("0.5");
    const updated = vouchers()[clientAddress].updatedBalance;

    const claimable = init.sub(updated);
    document.getElementById(`claimable-${clientAddress}`).innerText = ethers.utils.formatEther(claimable);
  }

  /**
   * to prevent repeated instantiations on react refresh.
   */
  function setClientChannel(channels, address) {
    if (channels[address] !== undefined) {
      return;
    }

    if (window.clientChannels === undefined) {
      window.clientChannels = {};
    }

    if (window.clientChannels[address] === undefined) {
      window.clientChannels[address] = new BroadcastChannel(address);
    }

    channels[address] = window.clientChannels[address];
  }

  /**
   * sends the provided wisdom across the application channel
   * with user at `clientAddress`.
   * @param {string} clientAddress
   */
  function provideService(clientAddress) {
    const channelInput = document.getElementById("input-" + clientAddress);
    if (channelInput) {
      const wisdom = channelInput.value;
      // console.log("sending: %s", wisdom);
      channels[clientAddress].postMessage(wisdom);
      document.getElementById(`provided-${clientAddress}`).innerText = wisdom.length;
    } else {
      console.warn(`Failed to get ChannelInput. Found: ${channelInput}`);
    }
  }

  function logVouchers() {
    console.log(`Vouchers: ${JSON.stringify(vouchers())}`);
  }

  /**
   * Take the stored payment voucher recieved from user at
   * `clientAddress` and apply it to the streamer contract on-chain.
   * @param {string} clientAddress
   */
  async function claimPaymentOnChain(clientAddress) {
    console.log("Claiming voucher on chain...");
    // logVouchers();

    if (vouchers()[clientAddress] == undefined) {
      console.warn(`no voucher found for ${clientAddress}`);
      return;
    }

    const updatedBalance = vouchers()[clientAddress].updatedBalance;
    const sig = ethers.utils.splitSignature(vouchers()[clientAddress].signature);

    tx(
      writeContracts.Streamer.withdrawEarnings({
        updatedBalance,
        sig,
      }),
    );
  }

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (DEBUG && address && selectedChainId && yourLocalBalance && readContracts && writeContracts) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [address, selectedChainId, yourLocalBalance, readContracts, writeContracts]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: ethers.utils.parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Streamer UI
            </Link>
          </Menu.Item>
          <Menu.Item key="/contracts">
            <Link
              onClick={() => {
                setRoute("/contracts");
              }}
              to="/contracts"
            >
              Debug Contracts
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {userIsOwner ? (
              //
              // UI for the service provider
              //
              <div>
                <h1>Hello Guru!</h1>
                <h2>
                  You have {chainChannels.opened.length} channel{chainChannels.opened.length == 1 ? "" : "s"} open.
                </h2>
                Channels with{" "}
                <Button size="small" danger type="primary">
                  RED
                </Button>{" "}
                withdrawal buttons are under challenge on-chain, and should be redeemed ASAP.
                <List
                  const
                  dataSource={chainChannels.opened}
                  renderItem={clientAddress => (
                    <List.Item key={clientAddress}>
                      <Address value={clientAddress} ensProvider={mainnetProvider} fontSize={12} />
                      <TextArea
                        style={{ margin: 5 }}
                        rows={3}
                        placeholder="Provide your wisdom here..."
                        id={"input-" + clientAddress}
                        onChange={e => {
                          e.stopPropagation();
                          provideService(clientAddress);
                        }}
                      ></TextArea>

                      <Card style={{ margin: 5 }} id={`status-${clientAddress}`}>
                        <div>
                          Served: <strong id={`provided-${clientAddress}`}>0</strong>&nbsp;chars
                        </div>
                        <div>
                          Recieved: <strong id={`claimable-${clientAddress}`}>0</strong>&nbsp;ETH
                        </div>
                      </Card>

                      {/* Checkpoint 5:
                      <Button
                        style={{ margin: 5 }}
                        type="primary"
                        danger={chainChannels.challenged.includes(clientAddress)}
                        disabled={chainChannels.closed.includes(clientAddress)}
                        onClick={() => {
                          claimPaymentOnChain(clientAddress);
                        }}
                      >
                        Cash out latest voucher
                      </Button> */}
                    </List.Item>
                  )}
                ></List>
                <div style={{ padding: 8 }}>
                  <div>Total ETH locked:</div>
                  {/* add contract balance */}
                </div>
              </div>
            ) : (
              //
              // UI for the service consumer
              //
              <div>
                <h1>Hello Rube!</h1>

                {hasOpenChannel() ? (
                  <div style={{ padding: 8 }}>
                    <Row align="middle">
                      <Col span={3}>
                        <Checkbox
                          defaultChecked={autoPay}
                          onChange={e => {
                            autoPay = e.target.checked;
                            console.log("AutoPay: " + autoPay);

                            if (autoPay) {
                              const wisdom = document.getElementById(`recievedWisdom-${userAddress}`).innerText;
                              reimburseService(wisdom);
                            }
                          }}
                        >
                          AutoPay
                        </Checkbox>
                      </Col>

                      <Col span={16}>
                        <Card title="Received Wisdom">
                          <span id={"recievedWisdom-" + userAddress}></span>
                        </Card>
                      </Col>

                      {/* Checkpoint 6: challenge & closure

                      <Col span={5}>
                        <Button
                          disabled={hasClosingChannel()}
                          type="primary"
                          onClick={() => {
                            // disable the production of further voucher signatures
                            autoPay = false;
                            tx(writeContracts.Streamer.challengeChannel());
                            try {
                              // ensure a 'ticking clock' for the UI without having
                              // to send new transactions & mine new blocks
                              localProvider.send("evm_setIntervalMining", [5000]);
                            } catch (e) {}
                          }}
                        >
                          Challenge this channel!
                        </Button>

                        <div style={{ padding: 8, marginTop: 32 }}>
                          <div>Timeleft:</div>
                          {timeLeft && humanizeDuration(timeLeft.toNumber() * 1000)}
                        </div>
                        <Button
                          style={{ padding: 5, margin: 5 }}
                          disabled={timeLeft && timeLeft.toNumber() != 0}
                          type="primary"
                          onClick={() => {
                            tx(writeContracts.Streamer.defundChannel());
                          }}
                        >
                          Close and withdraw funds
                        </Button>
                      </Col> */}
                    </Row>
                  </div>
                ) : hasClosedChannel() ? (
                  <div>
                    <p>Thanks for stopping by - we hope you have enjoyed the guru's advice.</p>
                    <p>
                      {" "}
                      This UI obstructs you from opening a second channel. Why? Is it safe to open another channel?
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: 8 }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        tx(writeContracts.Streamer.fundChannel({ value: ethers.utils.parseEther("0.5") }));
                      }}
                    >
                      Open a 0.5 ETH channel for advice from the Guru.
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Route>

          {/*
            this scaffolding is full of commonly used components.
            
            this <Contract/> component will automatically parse your ABI
            and give you a form to interact with it locally
          */}
          <Route path="/contracts">
            <Contract
              name="Streamer"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      <div style={{ marginTop: 32, opacity: 0.5 }}>
        {/* todo: Add your address here */}
        Created by <Address value={"Your...address"} ensProvider={mainnetProvider} fontSize={16} />
      </div>

      <div style={{ marginTop: 32, opacity: 0.5 }}>
        {/* todo: change fork location */}
        <a target="_blank" style={{ padding: 32, color: "#000" }} href="https://github.com/scaffold-eth/scaffold-eth">
          🍴 Fork me!
        </a>
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
