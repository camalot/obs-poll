"use strict";
$(function () {
	let poll = $(".poll");
	let channel = poll.data('channel');

	let _applyPollData = (data) => {

		if(data) {
			poll.removeClass("hidden");
		} else {
			poll.addClass("hidden");
		}

		poll.data("id", data.id);

		let title = $(".title", poll);
		title.html(data.title);

		let options = $(".options", poll);

		options.empty();
		for(var i in data.items) {
			let item = data.items[i];
			let li = $("<li />");

			let progress = $("<div class=\"progress\" />");
			let label = $("<div class=\"label\"/>");
			label.html(item.name);
			let pbar = $("<div class=\"bar\" />");

			progress.append(label);
			progress.append(pbar);
			li.append(progress);

			options.append(li);
		}
	};

	var socket = io(`/${channel}`).connect('http://localhost:3000');
	socket.on('poll.data', function (data) {
		console.log(data);
		return _applyPollData(data);
	});
});
