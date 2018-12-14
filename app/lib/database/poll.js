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

module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
	all: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.select(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	truncate: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	delete: (channel, id) => {

		// emit delete?

		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
	},
	insert: (channel, object) => {

		// emit create?

		let mongodb = new MongoDatabase(DATABASE_NAME);
		object.channel = stringUtils.safeChannel(channel);
		return mongodb.insert(COLLECTION_NAME, merge(object, { created: dateUtils.utc() }));
	},
	update: (channel, object) => {

		//emit update?

		let mongodb = new MongoDatabase(DATABASE_NAME);
		let update = merge(object, {});

		delete update._id;
		return mongodb
			.updateOne(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: object.id }, update);
	},
	find: (channel, filter, sort, limit) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.find(COLLECTION_NAME, merge(filter, { channel: stringUtils.safeChannel(channel) }), sort, limit || -1);
	},
	get: (channel) => {
		return new Promise((resolve, reject) => {
			let mongodb = new MongoDatabase(DATABASE_NAME);
			// return mongodb.get(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
			mongodb.find(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) }, { created: -1 }, 1)
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
		// return new Promise((resolve, reject) => {
		// 	return resolve({
		// 		id: "abc123",
		// 		channel: channel,
		// 		title: "Test Poll",
		// 		items: [
		// 			{ name: "Item 1", votes: [] },
		// 			{ name: "Item 2", votes: [] },
		// 			{ name: "Item 3", votes: [] },
		// 			{ name: "Item 4", votes: [] }
		// 		]
		// 	})
		// })

	}
};
