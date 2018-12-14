"use strict";
const async = require('async');
const merge = require('merge');

let calculateStats = (data) => {
	return new Promise((resolve, reject) => {
		if(data === null) {
			return resolve(null);
		}
		let totalVotes = 0;
		let clone = merge(data, {});
		async.each(clone.items, (item, next) => {
			totalVotes += item.votes.length;
			next();
		},
		(err) => {
			if(err) {
				return reject(err);
			}
			clone.totalVotes = totalVotes;
			async.each(clone.items, (i, n) => {
				let percentage = i.votes.length === 0 || totalVotes === 0 ? 0 : (i.votes.length / totalVotes) * 100;
				i.percentage = percentage || 0;
				i.voteCount = i.votes.length;
				n();
			}, (e) => {
				if(e) {
					return reject(e);
				}
				return resolve(clone);
			});

		});
	});
};


module.exports = {
	calculate: calculateStats
};
