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
	var id = Math.floor(Math.random() * 10000);
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
})

var getVendorID = (name) => {
	return 1;
}
