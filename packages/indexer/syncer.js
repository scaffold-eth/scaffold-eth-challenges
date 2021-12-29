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

const main = async (s3) => {

    const exists = async (name)=>{
      try{
        return await s3
          .headObject({
            Bucket: BUCKETNAME,
            Key: name,
          })
          .promise()
          .then(
            () => true,
            err => {
              if (err.code === 'NotFound') {
                return false;
              }
              throw err;
            }
          );
      }catch(e){
        console.log(e)
        return false
      }
    }

    const blocks = fs.readdirSync("blocks")
    for(let b in blocks){
      console.log(" 📋",blocks[b])
      const blockExists = await exists(blocks[b])
      console.log("blockExists",blockExists)
      if( blockExists ){
        console.log(" ✅",blocks[b])
      }else{
        console.log(" 📡",blocks[b])
        const params = {
          Bucket: BUCKETNAME,
          Key: blocks[b],
          Body: await fs.readFileSync("blocks/"+blocks[b])
        }
        //console.log("params",params)
        const uploadResult = await s3.putObject(params).promise();
        console.log("uploadResult",uploadResult)

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

if (!fs.existsSync("blocks")){
    fs.mkdirSync("blocks");
}

console.log("syncing blocks up to s3...")
// Load credentials and set Region from JSON file
AWS.config.loadFromPath('./aws.json');

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Create params JSON for S3.createBucket
var bucketParams = {
  Bucket : BUCKETNAME,
  ACL : 'public-read'
};

// Create params JSON for S3.setBucketWebsite
var staticHostParams = {
  Bucket: BUCKETNAME,
  WebsiteConfiguration: {
  ErrorDocument: {
    Key: 'index.html'
  },
  IndexDocument: {
    Suffix: 'index.html'
  },
  }
};

// Call S3 to create the bucket
s3.createBucket(bucketParams, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Bucket URL is ", data.Location);
    main(s3)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
})
