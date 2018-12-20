"use strict";

const express = require('express');
const router = express.Router();
const poll = require('../../lib/database/poll');
const merge = require('merge');
const utils = require('../../lib/utils');
const stringUtils = utils.string;
const stats = utils.stats;
const async = require('async');

router.get('/:channel', (req, res, next) => {
	return poll.get(req.params.channel)
		.then(r => {
			return res.json(r);
		})
		.catch(err => {
			return next(err);
		});
});

router.post('/reset', (req, res, next) => {
	let socket = res.locals.io;
	let channel = req.body.channel;
	let id = req.body.id;
	console.log(channel);
	console.log(id);
	return poll.get(channel, id)
		.then(r => {
			if (!r) {
				return next(new Error("No poll found."));
			}

			let clone = merge(r, {});
			delete clone._id;

			async.each(clone.items, (item, done) => {
				item.votes = [];
				return done();
			}, (err) => {
				if (err) {
					return next(err);
				}
				console.log("update");
				return poll.update(channel, clone)
					.then(r => {
						console.log("emit: poll.data");
						socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", r);
						return res.json(r);
					})
					.catch(err => {
						console.error(err);
						return next(err);
					});
			});
		})
		.catch(err => {
			return next(err);
		});
});

router.post('/winner/', (req, res, next) => {
	return new Promise((resolve, reject) => {
		let socket = res.locals.io;

		let channel = req.body.channel;
		let id = req.body.id;

		return poll.get(channel, id)
			.then((r) => {
				if (r && r.enabled) {
					let clone = merge(r, {});
					delete clone._id;
					clone.closed = true;
					clone.enabled = false;
					return poll.update(channel, clone);
				} else {
					return resolve(r);
				}
			})
			.then(r => {
				delete r._id;
				if (r) {
					return stats.calculate(r);
				} else {
					return resolve(r);
				}
			})
			.then(r => {
				if (r) {
					return stats.winner(r);
				} else {
					return resolve(r);
				}
			})
			.then(r => {
				socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.winner", r);
				return res.json(r);
			})
			.catch(err => {
				console.error(err);
				return next(err);
			});
	});
});

// end or start a poll.
// changes the state of 'enabled' to true/false
router.post('/state/', (req, res, next) => {
	return new Promise((resolve, reject) => {
		let socket = res.locals.io;

		let channel = req.body.channel;
		let id = req.body.id;
		let state = req.body.enabled;
		state = state === true || state === "true";
		return poll.get(channel, id)
			.then(r => {
				if (r && state) {
					return poll.updateMany(channel, { enabled: true }, { enabled: false })
						.then(results => {
							return new Promise((r1) => {
								return r1(r);
							});
						})
						.catch(err => {
							console.error(err);
							return reject(err);
						});
				} else {
					return new Promise((r1) => {
						return r1(r);
					});
				}
			})
			.then(r => {
				if (r && r.enabled !== state) {
					// update the poll
					let clone = merge(r, {});
					delete clone._id;
					clone.enabled = state;
					clone.closed = !state;
					return poll.update(channel, clone);
				} else {
					return new Promise((res1, rej1) => {
						// just return
						return res1(r);
					});
				}
			})
			.then(r => {
				if (r) {
					delete r._id;
					return stats.calculate(r);
				} else {
					return resolve(r);
				}
			})
			.then((r) => {
				socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", state ? r : null);
				return res.json(r);
			})
			.catch(err => {
				return next(err);
			});
	});
});


module.exports = router;
