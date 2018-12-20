"use strict";
const poll = require('../database/poll');
const botDb = require('../database/bot');
const async = require('async');
const utils = require('../utils');
const dateUtil = utils.date;
const stringUtils = utils.string;
const merge = require('merge');
const stats = utils.stats;

// allow: !vote2 !v2 !vote 2 !v 2 !vote #2 !v #2
const VOTE_COMMAND_REGEX = /^!v(?:ote)?\s?\#?(\d)/i;



class ChatPollHandler {

	constructor(chatHandler, socket) {
		let _this = this;
		this._chat = chatHandler;
		this._socket = socket;

		console.log("chat start handler");
		this._chat.on('chat', (channel, userstate, message, self) => {
			if (self || message === "" || message === null || message === undefined) {
				return;
			}

			botDb.get(channel)
				.then((data) => {
					return new Promise((resolve, reject) => {
						if (!data || !data.enabled) {
							console.log("no channel data");
							return resolve(null);
						} else {
							return resolve(data);
						}
					});
				}).then((channelData) => {
					if(channelData) {
						console.log("process channel chat");
						return _this._processChat(channel, userstate, message, self);
					} else {
						console.log("resolve no channel");
						return new Promise((resolve, reject) => resolve());
					}
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});

		});
	}

	_processChat(channel, userstate, message, self) {
		if (VOTE_COMMAND_REGEX.test(message)) {
			let vote = message.replace(/^!v(ote)?/, '').trim();
			console.log(`${channel}:${userstate.username} voted: ${vote}`);
			return this.vote(channel, userstate, vote);
		}
		console.log(`exit no matches: ${channel}:${userstate.username} => ${message}`);
	}

	vote(channel, userstate, vote) {
		let _this = this;
		// 12/11/2018 @dynamaxx19: 50 bits
		return new Promise((resolve, reject) => {
			return poll.get(channel)
				.then((data) => {
					if(data) {
						// have a poll
						let parsedIndex = parseInt(vote, 0);
						if (isNaN(parsedIndex)) {
							console.log(`Vote String '${vote}' is not a number`);
							return resolve(null);
						}
						// actual item index
						let voteIndex = parsedIndex - 1;
						let cloned = merge(data, {});
						delete cloned._id;

						if(voteIndex >= cloned.items.length) {
							console.log("vote index is outside the range of items");
							// vote index is outside the range
							return resolve(null);
						}

						// check if user already voted on any item...
						let existingVotes = cloned.items.filter((x) => {
							let filtered = x.votes.filter(y => {
								return y.username === userstate.username
							});
							return filtered.length > 0;
						});

						if(existingVotes.length > 0) {
							// has voted
							// should remove existing vote?
							console.log(`User already voted on '${existingVotes[0].name}'`);
							return resolve(null);
						}

						cloned.items[voteIndex].votes.push({
							username: userstate.username,
							timestamp: dateUtil.utc()
						});

						return poll.update(channel, cloned);
					} else {
						console.log("no active poll");
						// no active poll
						return resolve(null);
					}
				})
				.then((data) => {
					if(data) {
						console.log("update stats");
						return stats.calculate(data);
					} else {
						console.log("no data returned to send");
						return resolve(null);
					}
				})
				.then(data => {
					if(data) {
						delete data._id;
						console.log("emit poll.data");
						_this._socket.of(`/${stringUtils.safeChannel(channel)}`).emit("poll.data", data);
					}
					return resolve(data);
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}
}


module.exports = ChatPollHandler;
