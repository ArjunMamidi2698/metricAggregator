const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
require("dotenv").config({ path: "../.env" });

const port = process.env.SERVER_PORT || process.env.PORT || 2022;
const {
	aggregateMessage,
	getMessages,
	getAggregratedValue,
} = require("./services/aggregator.service");
const { addLog } = require("../utils/serviceUtils");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});
// middleware to log every route
app.use("/*", function route(req, res, next) {
	addLog(req.baseUrl);
	next();
});

// server response in json format
function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	if (data.hasOwnProperty("error")) {
		res.status(201).json(data); // if any error in data, sets status to 201
	} else {
		res.json(data);
	}
}
// routes for the app

// send Message from clients
app.post("/sendMessage", (req, res) => {
	const msgRes = aggregateMessage(req.body);
	handleJSONResponse(res, msgRes);
});

// get AggregratedValue with optional filter(success or fail)
app.get("/aggregatedValue", (req, res) => {
	var filter = req.query["filter"]; // success or fail
	handleJSONResponse(res, { aggregatedValue: getAggregratedValue(filter) });
});
// get messages list with optional filter(success or fail)
app.get("/getMessages", (req, res) => {
	var filter = req.query["filter"]; // success or fail
	const messages = getMessages(filter);
	handleJSONResponse(res, {
		length: messages.length,
		aggregatedValue: getAggregratedValue(filter),
		messages,
	});
});

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});

module.exports = server;
