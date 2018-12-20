"use strict";

const MongoDatabase = require("../MongoDatabase");
const config = require('../../config');
const dbconfig = config.mongodb;
const DATABASE_NAME = dbconfig.DATABASE;
const COLLECTION_NAME = "polls";
const merge = require('merge');
const utils = require('../utils');
const stringUtils = utils.string;
const dateUtils = utils.date;

let _latest = (channel) => {
	return new Promise((resolve, reject) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		channel = stringUtils.safeChannel(channel);
		mongodb.find(COLLECTION_NAME, { channel: channel, enabled: true }, { created: -1 }, 1)
			.then((results) => {
				if (results && results.length >= 1) {
					return resolve(results[0]);
				} else {
					return resolve(null);
				}
			}).catch((err) => {
				console.error(err);
				return reject(err);
			});
	});
};

let _get = (channel, id) => {
	if (!id) {
		return _latest(channel);
	} else {
		return new Promise((resolve, reject) => {
			let mongodb = new MongoDatabase(DATABASE_NAME);
			channel = stringUtils.safeChannel(channel);
			// return mongodb.get(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
			mongodb.find(COLLECTION_NAME, { channel: channel, id: id }, { created: -1 }, 1)
				.then((results) => {
					if (results && results.length >= 1) {
						return resolve(results[0]);
					} else {
						console.log("no poll for id: " + id);
						return resolve(null);
					}
				}).catch((err) => {
					console.error(err);
					return reject(err);
				});
		});
	}
};

let _setPollEnabled = (channel, id, enabled) => {
	return new Promise((resolve, reject) => {
		return _get(channel, id)
			.then((poll) => {
				if (poll) {
					let x = merge(poll, {});
					delete x._id;
					x.enabled = enabled;
					return _update(channel, x);
				} else {
					return resolve(null);
				}
			})
			.then((result) => {
				return resolve(result);
			})
			.catch(err => {
				console.error(err);
				return reject(err);
			});
	});
};

let _update = (channel, object) => {
	let mongodb = new MongoDatabase(DATABASE_NAME);
	let update = merge(object, {});

	delete update._id;
	return mongodb
		.updateOne(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: object.id }, update);
};

let _updateMany = (channel, filter, fields) => {
	let mongodb = new MongoDatabase(DATABASE_NAME);

	let selector = merge({ channel: stringUtils.safeChannel(channel) }, filter );
	return mongodb
		.updateMany(COLLECTION_NAME, selector, fields);
};

module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
	all: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.select(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) }, { created: -1 });
	},
	truncate: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	delete: (channel, id) => {

		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
	},
	insert: (channel, object) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		object.channel = stringUtils.safeChannel(channel);
		return mongodb.insert(COLLECTION_NAME, merge(object, { created: dateUtils.utc() }));
	},
	update: _update,
	updateMany: _updateMany,
	endPoll: (channel, id) => {
		return _setPollEnabled(channel, id, false);
	},

	startPoll: (channel, id) => {
		return _setPollEnabled(channel, id, true);
	},

	find: (channel, filter, sort, limit) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.find(COLLECTION_NAME, merge(filter, { channel: stringUtils.safeChannel(channel) }), sort, limit || -1);
	},
	latest: _latest,
	get: _get
};
