"use strict";

const express = require('express');
const router = express.Router();
const poll = require('../../lib/database/poll');
const merge = require('merge');
const utils = require('../../lib/utils');
const stringUtils = utils.string;
const stats = utils.stats;

router.get('/:channel', (req, res, next) => {
	return poll.get(req.params.channel)
		.then(r => {
			return res.json(r);
		})
		.catch(err => {
			return next(err);
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
		console.log(`state: ${state}`);
	return poll.get(channel, id)
		.then(r => {
			if(r && r.enabled !== state) {
				// update the poll
				let clone = merge(r, {});
				delete clone._id;
				clone.enabled = state === "true" || state;
				return poll.update(channel, clone);
			} else {
				return new Promise((resolve, reject) => {
					// just return
					return resolve(r);
				});
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
		.then((r) => {
			console.log("state change: emit update");
			console.log(r);
			socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", r.enabled ? r : null);
			return res.json(r);
		})
		.catch(err => {
			return next(err);
		});
	});
});


module.exports = router;
