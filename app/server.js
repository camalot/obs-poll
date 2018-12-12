"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser')
const logger = require("morgan");
const favicon = require("serve-favicon");
const config = require('./config');
const app = express();
const polldb = require('./lib/database/poll');

const server = require('http').Server(app);
const socket = require('socket.io')(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
require("./lib/hbs/xif");
require("./lib/hbs/sections");
app.use(favicon(path.join(__dirname, "assets/images", "bit13-16.png")));

// 12/11/2018 @dewberry512 1050 bits
// 12/11/2018 @zehava77 2

app.use(require('./lib/middleware/socketio')(socket));

require('./socket')(socket);

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

require("./routes")(app);

let chat = require('./lib/twitch/chat');
chat.initialize()
	.then((c) => {
		if (c) {
			console.log("register");
			return chat.register(socket);
		} else {
			return new Promise((resolve, reject) => {
				return resolve();
			});
		}
	})
	.then(() => {
		return polldb.init();
	})
	.catch(err => {
		console.error(err);
		return;
	});
// 404 error handler
app.use(
	require('./lib/express/handlers/FileNotFoundHandler')("Page Not Found", 404)
);

// 500 error handler
app.use(
	require('./lib/express/handlers/ErrorHandler')()
);

module.exports = { app: app, server: server, io: socket };
