"use strict";

const express = require('express');
const router = express.Router();
const poll = require('../../lib/database/poll');
let socketio;
router.get('/:channel', (req, res, next) => {
	return poll.get(req.params.channel)
		.then(r => {
			return res.json(r);
		})
		.catch(err => {
			return next(err);
		});
});


module.exports = router;
