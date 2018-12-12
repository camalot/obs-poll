'use strict';
const express = require('express');
const router = express.Router();

let socketio;

router.get('/', (req, res, next) => {
	return res.render("home");
});



module.exports = router;
