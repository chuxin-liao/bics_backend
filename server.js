var http = require('http');
var express = require('express');
var app = express()



app.get('/',function(req,res){
	res.send('hellooooo')
})

app.post('/', function (req, res) {
  res.send('POST request to the homepage')
})

app.get('/bla', function(req, rest){
	res.send('blablabla')
})

app.listen(1235);

var server = http.createServer(function(req, res) {
res.writeHead(200);
res.end('Hi everybody!');
});
server.listen(1234);