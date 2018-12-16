"use strict";

const express = require('express');
const app = express();
const router = express.Router();
const async = require('async');
const shortid = require('shortid');
const utils = require('../lib/utils');
const dateUtil = utils.date;
const stringUtils = utils.string;
const stats = utils.stats;
const poll = require('../lib/database/poll');
const auth = utils.auth;

router.get("/", auth.isLoggedIn, (req, res, next) => {
	let channel = req.user.username;
	let result = [];
	poll.all(channel)
		.then((polls) => {
			return async.each(polls, (item, done) => {
				return stats.calculate(item)
					.then((r) => {
						result.push(r);
						return done();
					})
					.catch(e => {
						return done(e);
					});
			}, (err) => {
				if(err) {
					return next(err);
				}
				return res.render('manage/list', { channel: channel, polls: result });
			});
		})
		.catch(err => {
			return next(err);
		});
});

router.get('/create/', auth.isLoggedIn, (req, res, next) => {
	let channel = req.user.username;
	return res.render("manage/editcreate", { channel: channel, poll: null });
});

router.get('/edit/:id', (req, res, next) => {
	let channel = req.user.username;
	poll.get(channel, req.params.id)
		.then((poll) => {
			if (poll) {
				return res.render("manage/editcreate", { channel: channel, poll: poll });
			} else {
				return next();
			}
		});
});

// 12/15/2018 @zehava77 100 bits #charity
// 12/15/2018 @capnyeti 100 #charity

router.post('/edit/:id', auth.isLoggedIn, (req, res, next) => {
	let socket = res.locals.io;
	let data = req.body;
	let channel = req.user.username || data.channel;
	let id = req.params.id || data.id;
	let items = data.items.map(x => { return { name: x, votes: [] } });
	return poll.update(channel, {
			id: id,
			title: data.title,
			channel: channel,
			items: items,
			enabled: data.enabled === undefined ? true : data.enabled,
			ends: data.ends === "" ? null : data.ends
		})
		.then((result) => {
			if (result) {
				// emit the update event;
				socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", result);
				return res.redirect(`/manage`);
			} else {
				next(new Error("Poll Not Added"));
			}
		})
		.catch((err) => {
			return next(err);
		});
});

router.post('/create/', auth.isLoggedIn, (req, res, next) => {
	let socket = res.locals.io;

	let data = req.body;
	let channel = req.user.username || data.channel;
	let items = data.items.map((x, i) => { return { name: x, votes: [], color: data.color[i] || "#f00" } });

	console.log(items);
	return poll.insert(channel, {
			id: shortid.generate(),
			title: data.title,
			channel: channel,
			items: items,
			enabled: data.enabled === undefined ? true : data.enabled,
			created: dateUtil.utc(),
			ends: data.ends === "" ? null : data.ends
		})
		.then((result) => {
			if (result) {
				// emit the update event;
				socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", data);
				return res.redirect(`/manage`);
			} else {
				next(new Error("Poll Not Added"));
			}
		})
		.catch((err) => {
			return next(err);
		});
});

router.post('/delete/:id', auth.isLoggedIn, (req, res, next) => {
	let socket = res.locals.io;
	// 12/15/2018 @sarge113 $20 "Merry Christmas"
	let data = req.body;
	let channel = req.user.username || data.channel;
	let id = req.params.id || data.id;

	return poll.get(channel, id)
		.then((polldata) => {
			if(polldata && polldata.title === data.title) {
				return poll.delete(channel, id);
			} else {
				return new Promise((resolve, reject) => {
					return reject("no poll found. return nothing");
				});
			}
		})
		.then(result => {
			return new Promise((resolve, reject) => {
					// tell ui that the poll is a gonner.
				socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", result);
				// @a55ass1n_666 10 bits #charity
				return resolve(result);
			});
		})
		.then((result) => {
			return res.redirect('/manage');
		})
		.catch(err => {
			return next(err);
		});
});

module.exports = router;
