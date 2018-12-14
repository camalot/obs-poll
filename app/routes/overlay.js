'use strict';
const express = require('express');
const router = express.Router();
let socketio;

router.get('/:channel', (req, res, next) => {
	return res.render("overlay/index", { channel: req.params.channel, layout: 'overlay/layout' });
});


module.exports = router;
