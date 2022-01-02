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

  for(let i=LASTBLOCK+1;i<=LASTBLOCK+100000;i++){
    //console.log("I",)
    let found = false
    try {
      if (await fs.existsSync(testFolder+""+i+".json")) {
        //file exists
        console.log("REMOVING 2022 block",i)
        await fs.unlinkSync(testFolder+""+i+".json")
      }
      else{
        //console.log("NOT FOUND")
      }
    } catch(err) {
      //console.log("ERR ")
    }

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

if (!fs.existsSync("grabbed")){
    fs.mkdirSync("grabbed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
