var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());
app.use(bodyParser.json());

var port = 1235;

app.listen(port, function () {
  console.log("alive: " + port);
});

app.get('/',function(req,res){
	res.send('hellooooo')
})

app.post('/create_proposal', function (req, res) {
    
})
