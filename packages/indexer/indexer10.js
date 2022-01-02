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

  const LASTBLOCK = 11946960

  let total = LASTBLOCK-FIRSTBLOCK
  let missing = 0
  let foundCount = 0
  let totalTxCount = 0

  for(let i=LASTBLOCK;i>=FIRSTBLOCK;i--){
    //console.log("I",)
    let found = false
    try {
      if (await fs.existsSync(testFolder+""+i+".json")) {
        //file exists
        found=true
        foundCount++
        //console.log("FOUND",i)
        let contents = await fs.readFileSync(testFolder+""+i+".json")
        let obj = JSON.parse(contents.toString())
        totalTxCount+=obj.transactions.length
        console.log(" 💻  PARSING TRANSACTIONS FROM BLOCK ",i," -- ",obj.transactions.length,"transactions -- ",foundCount," out of ",total,parseInt(foundCount*100/total)+"% -- ",totalTxCount,"total txns");
        for(let t in obj.transactions) {
          let transaction = obj.transactions[t]
          //console.log(transaction)

          let toAddress = transaction.to
          let fromAddress = transaction.from

          addTransaction(toAddress, transaction)
          addTransaction(fromAddress, transaction)
        }
        //process.exit(0)
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
  console.log("TOTAL TXNS of 2021:",totalTxCount)
  fs.writeFileSync("report.txt",missing+","+foundCount+","+totalTxCount)
}


function addTransaction(address, transaction){
  //console.log("ADDING TX FOR",address,"WITH HASH",transaction.hash)
  let currentTransactionsForAddress = []
  let fileContents
  try{
    fileContents = fs.readFileSync("addresses/"+address+".json")
  }catch(e){
    //console.log(e)
  }
  //console.log("HEREH")
  if(fileContents){
    //console.log("PARSING")
    currentTransactionsForAddress = JSON.parse(fileContents.toString())
  }else{
    //console.log("no file contents")
  }
  //console.log("currentTransactionsForAddress",currentTransactionsForAddress)
  let exists = false
  //console.log("looking for existing tx...")
  for(let tx in currentTransactionsForAddress){
    //console.log("COMPARE",currentTransactionsForAddress[tx].hash,transaction.hash)
    if(currentTransactionsForAddress[tx].hash == transaction.hash){
      exists=true;
    }
  }
  if(!exists){
    //console.log("💾 doesn't exist, adding tx...")
    currentTransactionsForAddress.push(transaction)
    fs.writeFileSync("addresses/"+address+".json",JSON.stringify(currentTransactionsForAddress,null,2))
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

if (!fs.existsSync("addresses")){
    fs.mkdirSync("addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
