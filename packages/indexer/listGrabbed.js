var fs = require("fs");
var ethers = require("ethers");


// 🛰 Providers!
//
// https://docs.ethers.io/v5/api/providers/provider/#Provider
//

let foundTransactions = []

const main = async () => {

  console.log(" 📋 listing grabbed blocks...")

  const testFolder = 'grabbed/';
  const fs = require('fs');

  const fullList = fs.readdirSync(testFolder)
  console.log(" 🔍 found "+fullList.length+" items")

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
