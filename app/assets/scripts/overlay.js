"use strict";
$(() => {
	let poll = $(".poll");
	let closed = $(".closed");

	let channel = poll.data('channel');

	let _applyPollData = (data) => {
		if(data && data.closed && !data.items) {
			return _showWinner(data);
		}

		closed.addClass("hidden");
		if (data && data.enabled) {
			poll.removeClass("hidden");
		} else {
			poll.addClass("hidden");
		}

		let title = $(".title", poll);
		title.html(data.title);

		let options = $(".options", poll);

		options.empty();
		for (var i in data.items) {
			let item = data.items[i];
			let li = $("<li />");

			let progress = $("<div class=\"progress\" />");
			let label = $("<div class=\"label\"/>");
			label.html(item.name);
			let pbar = $("<div class=\"bar\" />");
			setTimeout(() => {
				pbar.css("width", `${item.percentage}%`);
			}, 300);
			if (item.color) {
				pbar.css("background-color", item.color);
			}
			progress.append(label);
			progress.append(pbar);
			li.append(progress);

			options.append(li);
		}
	};

	let _showWinner = (data) => {
		/*
<div class="closed hidden">
	<div class="title"></div>
	<div class="winning"></div>
	<div class="votes"></div>
</div>
		*/
		poll.addClass("hidden");
		let title = $(".title", closed);
		title.html(data.title);
		let win = $(".winning", closed);
		win.html(data.item);
		let votes = $(".votes", closed);
		votes.html(data.votes);
		closed.removeClass("hidden");

	};

	var socket = io(`/${channel}`).connect(`${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ''}/`);
	socket
		.on('poll.start', (data) => {

		})
		.on('poll.end', (data) => {

		})
		.on('poll.data', (data) => {
			return _applyPollData(data);
		})
		.on("poll.winner", (data) => {
			return _showWinner(data);
		});
});
