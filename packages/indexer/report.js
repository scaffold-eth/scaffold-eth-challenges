var fs = require("fs");
var ethers = require("ethers");
const AWS = require('aws-sdk');

const BUCKETNAME = "jsonethblocks2021";

if (!BUCKETNAME) {
  console.log("☢️   Enter a bucket name in packages/react-app/scripts/s3.js ");
  process.exit(1);
}

let credentials = {};
try {
  credentials = JSON.parse(fs.readFileSync("aws.json"));
} catch (e) {
  console.log(e);
  console.log(
    '☢️   Create an aws.json credentials file in packages/react-app/ like { "accessKeyId": "xxx", "secretAccessKey": "xxx", "region": "xxx" } ',
  );
  process.exit(1);
}

const main = async () => {
  const testFolder = 'grabbed/';

  const mainnetProvider = new ethers.providers.JsonRpcProvider("http://localhost:48545")

  console.log("  📋  looking through all possible blocks...")

  const FIRSTBLOCK = 11566960

  const LASTBLOCK = 13916165

  let missing = 0
  let foundCount = 0

  for(let i=FIRSTBLOCK;i<=LASTBLOCK;i++){
    //console.log("I",)
    let found = false
    try {
      if (await fs.existsSync(testFolder+""+i+".json")) {
        //file exists
        found=true
        foundCount++
        //console.log("FOUND",i)
      }
      else{
        //console.log("NOT FOUND")
      }
    } catch(err) {
      //console.log("ERR ")
    }
    if(!found){
      console.log('\t'," 🕵️ MISSING ",i)
      missing++;
      /*let currentBlock = await mainnetProvider.getBlock(i)
      console.log(" 📦  BLOCK #",i," -- ",currentBlock.timestamp,timeConverter(currentBlock.timestamp)," -- ",currentBlock.transactions.length," transactions")

      let loadedTransactions = []
      for(let t in currentBlock.transactions){
        const transaction = currentBlock.transactions[t]
        const txData = await mainnetProvider.getTransaction(transaction)
        loadedTransactions.push(txData)
      }
      currentBlock.transactions = loadedTransactions
      fs.writeFileSync("grabbed/"+i+".json",JSON.stringify(currentBlock))*/
    }
  }



  console.log("TOTAL MISSING:",missing)
  console.log("TOTAL FOUND:",foundCount)
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

if (!fs.existsSync("grabbed")){
    fs.mkdirSync("grabbed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
