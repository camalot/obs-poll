"use strict";
const poll = require('./lib/database/poll');
const bot = require('./lib/database/bot');
const async = require('async');
const utils = require('./lib/utils');
const stats = utils.stats;

module.exports = (io) => {
	return new Promise((resolve, reject) => {
		return bot.all()
			.then((channels) => {
				async.each(channels, (item, next) => {
					console.log(`init socket for: ${item.channel}`);
					io.of(`/${item.channel}`).on("connection", (socket) => {
						return new Promise((res, rej) => {
							// socket.nsp = socket namespace
							if (!socket.nsp) {
								console.log("no socket nsp");
								return res(null);
							}

							return poll.latest(item.channel)
								.then((data) => {
									if (!data) {
										// seems to return no data when changing the state of the poll.
										console.log("no data");
										return res(null);
									}
									return stats.calculate(data ? data : null);
								})
								.then(data => {
									delete data._id;
									console.log(`emit to ${item.channel}: poll.data`);
									socket.emit('poll.data', data);
									return res(data);
								})
								.catch(err => {
									return rej(err);
								});
						});
					});
					return next();
				}, (err) => {
					if (err) {
						console.error(err);
						return reject(err);
					}
					return resolve();
				});

			});
	});
};





// let io;

// let create = (server) => {
// 	console.log("create server");
// 	io = socketio(server);

// 	io.on('connection', (socket) => {
// 		return new Promise((resolve, reject) => {
// 			return poll.get("darthminos")
// 				.then((pdata) => {

// 					socket.emit('poll.data', pdata ? pdata[0] : null);

// 					socket.on('poll.update', (data) => {
// 						console.log(data);
// 					});
// 					socket.on('disconnect', () => {
// 						io.emit('user disconnected');
// 					});

// 					return resolve();
// 				})
// 				.catch((err) => {
// 					console.error(err);
// 				});
// 		});
// 	});

// 	return io;
// };

// module.exports = create;
