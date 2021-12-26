var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.status(200).send("Hello World!!!");
});

app.get("/:address", function(req, res) {
  console.log("/:address",req.params)
  res.status(200).send("**SOMEOUTPUT**");
});

app.post('/', function(request, response){
  console.log("POOOOST!!!!",request.body);      // your JSON
  response.send(request.body);    // echo the result back
});

//detect
if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(54727, () => {
    console.log('HTTPS Listening: 54727')
  })
}else{
  var server = app.listen(54727, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}
