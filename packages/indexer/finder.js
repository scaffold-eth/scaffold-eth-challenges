var fs = require("fs");
var ethers = require("ethers");


// 🛰 Providers!
//
// https://docs.ethers.io/v5/api/providers/provider/#Provider
//

let foundTransactions = []

const main = async () => {

  console.log(" 🛰  connecting to a provider...")

  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("http://10.0.0.127:8545")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("http://localhost:48545")
  const mainnetProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

  console.log(" 📡  getting current blocknumber...")

  let currentBlockNumber = await mainnetProvider.getBlockNumber()

  // 12 11766960 to 11661960  + 11661960 to 11566960
  // 11 11946960 to 11861960 + 11861960 to 11766960
  // 10 12146960 to 12041960 + 12041960 to 11946960
  // 9 12341960 to 12246960 + 12246960 to 12146960
  // 8 12541960 to 12441960 + 12441960 to 12341960
  // 7 12736960 to 12641960 + 12641960 to 12541960
  // 6 12936960 to 12831960 + 12831960 to 12736960
  // 5 13136960 to 13031960 + 13031960 to 12936960
  // 4 13326960 to 13231960 + 13231960 to 13136960
  // 3 13526960 to 13421960 + 13421960 to 13326960
  // 2 13716960 to 13621960 + 13621960 to 13526960
  // 1 CURRENTBLOCK to 13811960 + 13811960 to 13716960
   ////13895173
  // 11566960 is the first block of 2021

  while(true){

    let currentBlock = await mainnetProvider.getBlock(currentBlockNumber)
    console.log(" 📦  BLOCK #",currentBlockNumber," -- ",currentBlock.timestamp,timeConverter(currentBlock.timestamp)," -- ",currentBlock.transactions.length," transactions")

    currentBlockNumber--;
  }

}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

if (!fs.existsSync("blocks")){
    fs.mkdirSync("blocks");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
