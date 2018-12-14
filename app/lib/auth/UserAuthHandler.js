"use strict";

const bot = require('../database/bot');

function UserAuthHandler(accessToken, refreshToken, profile, done) {

	return bot.join()
		.then((result) => {
			return done(null, profile);
		})
		.catch(err => {
			console.error(err);
			return done(err);
		});

}

module.exports = UserAuthHandler;
