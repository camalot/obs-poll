"use strict";

const express = require('express');
const app = express();
const router = express.Router();
const shortid = require('shortid');
const utils = require('../lib/utils');
const dateUtil = utils.date;

const poll = require('../lib/database/poll');
router.get('/:channel', (req, res, next) => {
	return res.render("manage", { channel: req.params.channel });
});

router.post('/:channel?', (req, res, next) => {
	let data = req.body;
	console.log(data);
	let channel = req.params.channel || data.channel;
	let items = data.items.map(x => { return { name: x, votes: [] } });
	return poll.insert(channel, {
		id: shortid.generate(),
		title: data.title,
		channel: channel,
		items: items,
		enabled: true,
		created: dateUtil.utc(),
		ends: null
	})
		.then((result) => {
			if (result) {
				// emit the update event;
				res.locals.io.sockets.emit("poll.data", result);
				return res.render("manage", { channel: result.channel });
			} else {
				next(new Error("Poll Not Added"));
			}
		})
		.catch((err) => {
			return next(err);
		});
});

module.exports = router;
