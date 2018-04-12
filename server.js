var bodyParser = require('body-parser');
var request = require('request');
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
	var id = Math.floor(Math.random() * 1000000);
	var proposal = {
		"$class": "org.acme.biccoins.Proposal",
		"proposalId": id,
		"totalCost": req.body.cost,
		"deptApproval": "false",
		"vendorApproval": "false",
		"transferred": "false",
		"Description": req.body.description,
		"student": "resource:org.acme.biccoins.Submitter#" + req.body.studentid,
		"vendor": "resource:org.acme.biccoins.Vendor#" + getVendorID(req.body.vendor),
		"school": "resource:org.acme.biccoins.GoverningBody#1"
	};
	request({
		url: "http://localhost:3000/api/org.acme.biccoins.Proposal",
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(proposal)
	}, function(err, response, body) {
		if (err) {
			console.log("Error creating proposal: " + err);
			res.sendStatus(400);
		} else {
			console.log("Successfully created proposal " + id);
			res.sendStatus(200);
		}
	});
});

app.get("/retrieve_proposals", (req, res) => {
	request({
		url: "http://localhost:3000/api/org.acme.biccoins.Proposal",
		method: "GET",
		headers: {"Content-Type": "application/json"}
	}, function(err, response, body) {
		if (err) {
			console.log("Error retrieving proposal: " + err);
			res.sendStatus(400);
		} else {
			console.log("Successfully retrieved proposal");
			res.status(200).send(body);
		}
	});
});

app.post("/approve", (req, res) => {
	var url;
	var body = {
		"$class": "org.acme.biccoins.Transfer",
		"prop": "resource:org.acme.biccoins.Proposal#" + req.body.proposalId
	};
	if (req.body.by == "student") {
		url = "http://localhost:3000/api/org.acme.biccoins.Transfer";
	}
	if (url) {
		request({
			url: url,
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(body)
		}, function(err, response, body) {
			if (err) {
				console.log("Error approving proposal: " + err);
				res.sendStatus(400);
			} else {
				console.log("Successfully approved proposal " + req.body.proposalId);
				res.status(200);
			}
		});
	}
});
/*
	view proposal - GET all proposals from the API
	dept head approve proposal - POST mark the dept status as approved
	vendor head approve proposal - POST mark the dept status as approved
	student approve proposal - POST mark the status as approved and also transfer money from NUS to vendor
	retrieve balance of vendor - GET balance of a vendor
	retrieve balance of NUS - GET balance of a vendor
	create tokens - POST increase NUS balance by certain amount
	cashout - POST descrease a vendor balance by certain amount
	getVendorID - a function to find vendor ID by name

*/
var getVendorID = (name) => {
	return 1;
}
