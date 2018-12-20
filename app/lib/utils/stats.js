"use strict";
const async = require('async');
const merge = require('merge');

let calculateStats = (data) => {
	return new Promise((resolve, reject) => {
		if (data === null) {
			return resolve(null);
		}
		let totalVotes = 0;
		let clone = merge(data, {});
		async.each(clone.items, (item, next) => {
			totalVotes += item.votes.length;
			next();
		},
			(err) => {
				if (err) {
					return reject(err);
				}
				clone.totalVotes = totalVotes;
				async.each(clone.items, (i, n) => {
					let percentage = i.votes.length === 0 || totalVotes === 0 ? 0 : (i.votes.length / totalVotes) * 100;
					i.percentage = percentage || 0;
					i.voteCount = i.votes.length;
					n();
				}, (e) => {
					if (e) {
						return reject(e);
					}
					return resolve(clone);
				});

			});
	});
};

let _winner = (data) => {
	return new Promise((resolve, reject) => {
		return calculateStats(data)
			.then(d => {
				let arr = data.items.map((x, i) => { return { count: x.voteCount, index: i } });
				arr.sort((x, y) => {
					if (x.count > y.count) { return -1; }
					if (x.count < y.count) { return 1; }
					return 0;
				});
				let winner = null;
				if (arr && arr.length > 0) {
					let itemData = arr[0];
					winner = {
						id: data.id,
						channel: data.channel,
						title: data.title,
						item: data.items[itemData.index].name,
						votes: data.items[itemData.index].votes.length || 0,
						closed: true
					};
				}
				return resolve(winner);
			}).catch(err => {
				console.error(err);
				return reject(err);
			});
	});
};


module.exports = {
	calculate: calculateStats,
	winner: _winner
};
