'use strict';
const config = require('../../config');

module.exports = {
	isLoggedIn: (req, res, next) => {
		process.nextTick(() => {
			// if user is authenticated in the session, carry on
			if (req.user && req.isAuthenticated()) {
				return next();
			}
			// if they aren't redirect them to the home page
			return res.redirect('/login');
		});
	},

	isApiKeyValid: (req, res, next) => {
		let api_key = config.apiRequestToken;
		if (req.get("X-DM-API-TOKEN") === api_key || req.query.token === api_key) {
			return next();
		}

		return next(new Error("Invalid API Token"));

	},
	isAdmin: (req, res, next) => {
		process.nextTick(() => {
			let channel = req.params.channel || null;
			if ((req.user && req.isAuthenticated()) && req.user.id && req.user.id === channel) {
				return next();
			}
		});
	}
};
