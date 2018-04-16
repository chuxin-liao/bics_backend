var bodyParser = require('body-parser');
var request = require('request');
var express = require('express');
var cors = require('cors');
var app = express();
var _ = require("underscore");

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
	emailtoID(req.body.email, 'Student', '', res, callback);
	function callback(list, id, res) {
		console.log("id: " + id);
	var pid = Math.floor(Math.random() * 1000000);
	var proposal = {
		"$class": "org.acme.biccoins.Proposal",
		"proposalId": pid,
		"totalCost": req.body.cost,
		"deptApproval": "false",
		"vendorApproval": "false",
		"transferred": "false",
		"representingBody": req.body.department,
		"Description": req.body.description,
		"student": id,
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
}
});


app.post('/create_tokens', function (req, res) {
	var tokens = {
		"$class": "org.acme.biccoins.CreateTokens",
  		"addedValue": req.body.tokens,
  		"school": "resource:org.acme.biccoins.GoverningBody#1"
		
	};
	request({
		url: "http://localhost:3000/api/org.acme.biccoins.CreateTokens",
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(tokens)
	}, function(err, response, body) {
		if (err) {
			console.log("Error creating tokens: " + err);
			res.sendStatus(400);
		} else {
			console.log("Successfully created tokens" );
			res.sendStatus(200);
		}
	});
});


app.post("/retrieve_proposals", (req, res) => {
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
			body = JSON.parse(body)
			for (p in body){
				body[p]['vendor'] = getVendorName(body[p]['vendor'])
			}
			if(req.body.role == 'NUS' || req.body.role =='Financial Guarantor'){
				res.status(200).send(body);
			}
			else{
				function sendFiltered(list, id, res) {
					if(req.body.role == 'Student'){
						var filtered = _.where(list, {"student":id});
					}else if (req.body.role == 'Vendor'){
						var filtered = _.where(list, {"vendor":id});
					}else{
						var filtered = _.where(list, {"representingBody":id});
					}
					res.status(200).send(filtered);
				}
				emailtoID(req.body.email, req.body.role, body, res, sendFiltered);
			}	
			
		}
	});
});

app.post('/cashout', function (req, res) {
	var proposal = {
		"$class": "org.acme.biccoins.Cashout",
		 "amount": req.body.tokens,
		 "vendor": "resource:org.acme.biccoins.Vendor#" + getVendorID(req.body.vendor),
		 "bank": "resource:org.acme.biccoins.FinancialBacker#1",
		 "school": "resource:org.acme.biccoins.GoverningBody#1"
		 
	};
	request({
		url: "http://localhost:3000/api/org.acme.biccoins.Cashout",
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(proposal)
	}, function(err, response, body) {
		if (err) {
			console.log("Error cashing out tokens " + err);
			res.sendStatus(400);
		} else {
			console.log("Successfully cashed out tokens ");
			console.log(body);
			res.sendStatus(200);
		}
	});
})

app.post('/register', function (req, res) {
	var proposal = {
  		"$class": "org.acme.biccoins.Submitter",
 		"studentId": req.body.id,
  		"name": req.body.first_name + req.body.last_name,
  		"representingBody": req.body.department,
 		"matricNumber": req.body.matric,
  		"email": req.body.email		 
	};
	console.log(proposal);
	request({
		url: "http://localhost:3000/api/org.acme.biccoins.Submitter",
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(proposal)
	}, function(err, response, body) {
		if (err) {
			console.log("Error registering" + err);
			res.sendStatus(400);
		} else {
			console.log("Successfully registered");
			res.sendStatus(200);
		}
	});
})

app.post("/approve", (req, res) => {
	var url;
	var body;
	emailtoID_2(req.body.email, req.body.by, '', res, callback);
	function callback(list, id, res) {
		console.log(id);
	if (req.body.by == "Student") {
		url = "http://localhost:3000/api/org.acme.biccoins.Transfer";
		body = {
		"$class": "org.acme.biccoins.Transfer",
		"prop": "resource:org.acme.biccoins.Proposal#" + req.body.proposalId
		};
	}else if (req.body.by == "Department Staff"){
		url = "http://localhost:3000/api/org.acme.biccoins.ChangeProposalStatus_Approver";
		body = {
		  "$class": "org.acme.biccoins.ChangeProposalStatus_Approver",
		  "proposal": "resource:org.acme.biccoins.Proposal#" + req.body.proposalId,
		  "approver": "resource:org.acme.biccoins.Approver#" + id
		};
	}else {
		url = "http://localhost:3000/api/org.acme.biccoins.ChangeProposalStatus_Vendor"
		body = 	{
		  "$class": "org.acme.biccoins.ChangeProposalStatus_Vendor",
		  "proposal": "resource:org.acme.biccoins.Proposal#"+req.body.proposalId,
		  "vendor": "resource:org.acme.biccoins.Vendor#" + id
		}
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
				console.log(body);
				res.sendStatus(200);
			}
		});
	}
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
	var dict = {}; // create an empty array
	dict['NTUC FairPrice'] = 1;
	dict['PGP Nanyang Mart'] = 2;
	dict['Popular Bookstore'] = 3;
	dict['NBC Stationery & Gifts'] = 4;
	dict['PaperMarket'] = 5;
	// dict['1'] = "NTUC FairPrice"
	// dict['2'] = "PGP Nanyang Mart"
	// dict['3'] = "Popular Bookstore"
	// dict['4'] = "NBC Stationery & Gifts"
	// dict['5'] = "PaperMarket"
	return dict[name];

}

var getVendorName = (name) => {
	var dict = {};
	dict['1'] = "NTUC FairPrice"
	dict['2'] = "PGP Nanyang Mart"
	dict['3'] = "Popular Bookstore"
	dict['4'] = "NBC Stationery & Gifts"
	dict['5'] = "PaperMarket"

	var id = name.slice(-1);
	 // create an empty array
	
	return dict[id];

}

var emailtoID = (email, role, list, res, callback) => {
		console.log("e: " + email);
	if(role == 'Student'){
		
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Submitter",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering student view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered student view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = "resource:org.acme.biccoins.Submitter#"+filtered[0]['studentId'];
					console.log("emailtoID: " + id)
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});
	}else if(role == 'Vendor'){
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Vendor",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering vendor view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered vendor view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = filtered[0]['vendorName'];
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});
	}else {
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Approver",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering approver view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered approver view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = filtered[0]['representingBody'];
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});

	}
}

	var emailtoID_2 = (email, role, list, res, callback) => {
		console.log("e: " + email);
		if(role == 'Student'){
		
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Submitter",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering student view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered student view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = "resource:org.acme.biccoins.Submitter#"+filtered[0]['studentId'];
					console.log("emailtoID: " + id)
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});
	}else if(role == 'Vendor'){
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Vendor",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering vendor view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered vendor view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = filtered[0]['vendorId'];
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});
	}else {
		request({
			url: "http://localhost:3000/api/org.acme.biccoins.Approver",
			method: "GET",
			headers: {"Content-Type": "application/json"},
		}, function(err, response, body) {
			if (err) {
				console.log("Error filtering approver view: " + err);
				callback(list, '', res);
			} else {
				console.log("Successfully filtered approver view ");
				body = JSON.parse(body)
				var filtered =  _.where(body, {"email": email});
				if (filtered.length > 0) {
					var id = filtered[0]['approveId'];
					callback(list, id, res);
				} else {
					callback(list, '', res);
				}
			}
		});

	}
}



