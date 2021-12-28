var fs = require("fs");
var ethers = require("ethers");


// 🛰 Providers!
//
// https://docs.ethers.io/v5/api/providers/provider/#Provider
//

let foundTransactions = []

const main = async () => {

  //console.log(" 🛰  connecting to a provider...")

  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("http://10.0.0.127:8545")
  //const mainnetProvider = new ethers.providers.JsonRpcProvider("http://localhost:48545")
  const mainnetProvider = new ethers.providers.JsonRpcProvider("http://localhost:48545")
  //console.log(" 📡  getting current blocknumber...")

  let getBlockNumber = await mainnetProvider.getBlockNumber()
  console.log(getBlockNumber)

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
