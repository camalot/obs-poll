"use strict";
let MAX_ITEMS = 4;

let actions = {
	"add-item": (sender) => {

		let container = $("[data-container='poll-items']");


		let items = $("[name=items]", container);
		if (items.length >= MAX_ITEMS) {
			console.log("exit, we have reached the max number of items.");
			return;
		}

		let template = $($("template[data-id='poll-item']").html());
		//let newTemplate = $("<div />").append(template);
		container.append(template);
		componentHandler.upgradeElements(template.get(0));
		init(template);

		checkMax();
	},
	"delete-item": (sender) => {
		let item = $(sender).closest("[data-type='item']");
		$(item).remove();
		checkMax();
	},
	"poll-state": (sender) => {
		console.log("poll-state");
		let url = '/api/poll/state/';
		let source = $(sender);
		$.ajax(url, {
			method: "post",
			data: {
				id: source.data("id"),
				channel: source.data("channel"),
				enabled: source.data("enabled") === "true" || source.data("enabled") === true
			},
			success: (data, status, xhr) => {
				if (data) {

					// hide the details of inactive polls
					$(".poll-details").addClass("hidden");

					if (data.enabled) {
						// show the details of newly active poll
						$(`.mdl-card[data-id="${data.id}"] .poll-details`)
							.removeClass("hidden");
					}

					// set the state of the buttons of all "other" polls
					$(`[data-name="poll-winner"]`)
						.not(`.mdl-card[data-id="${data.id}"] [data-name="poll-winner"]`)
						.attr("disabled", true);
					$(`[data-name="poll-end"]`)
						.not(`.mdl-card[data-id="${data.id}"] [data-name="poll-end"]`)
						.attr("disabled", true);
					$(`[data-name="poll-start"]`)
						.not(`.mdl-card[data-id="${data.id}"] [data-name="poll-start"]`)
						.attr("disabled", false);

					// change state of active poll buttons
					$(`[data-name="poll-winner"][data-id="${data.id}"]`).attr("disabled", !data.enabled);
					$(`[data-name="poll-end"][data-id="${data.id}"]`).attr("disabled", !data.enabled);
					$(`[data-name="poll-start"][data-id="${data.id}"]`).attr("disabled", data.enabled);
				}
			}
		});
	},
	"show-winner": (sender) => {
		let source = $(sender);
		let url = '/api/poll/winner/';
		$.ajax(url, {
			method: "post",
			data: {
				id: source.data("id"),
				channel: source.data("channel")
			},
			success: (data, status, xhr) => {
				if (data) {
					$(`[data-name="poll-winner"][data-id="${data.id}"]`).attr("disabled", data.closed);
					$(`[data-name="poll-end"][data-id="${data.id}"]`).attr("disabled", !data.closed);
					$(`[data-name="poll-start"][data-id="${data.id}"]`).attr("disabled", data.closed);
				}
			}
		});
	},
	"poll-reset": (sender) => {
		let source = $(sender);
		let url = '/api/poll/reset/';
		$.ajax(url, {
			method: "post",
			data: {
				id: source.data("id"),
				channel: source.data("channel")
			},
			success: (data, status, xhr) => {
				console.log(data);
			}
		});
	}
};

let checkMax = () => {
	let container = $("[data-container='poll-items']");
	let items = $("[name=items]", container);

	if (items.length >= MAX_ITEMS) {
		$("[data-action='add-item']").attr("disabled", true);
	} else {
		$("[data-action='add-item']").attr("disabled", false);
	}
};


let generateRandomColor = () => {
	let chars = "0123456789abcdef";
	let color = "#";
	for (let x = 0; x < 6; ++x) {
		color += chars[Math.floor(Math.random() * 16)];
	}
	return color;
};

let init = function (base) {
	$("[data-action]", $(base || document))
		.on("click", function (e) {
			let action = $(this).data("action");
			if (actions[action]) {
				actions[action](this);
			}
		});

	if (base) {
		let hexColor = generateRandomColor();
		$("[data-type=color]", base).val(hexColor);
	}
	$("[data-type=color]").spectrum({
		showInput: true,
		chooseText: "OK",
		preferredFormat: "hex3",
		cancelText: "CANCEL",
		clickoutFiresChange: true,
		showInitial: true,
	}).on("change.spectrum", (e, color) => {

	});

	$('[data-type=datetimepicker]').datetimepicker({
		mask: true,
		minDate: new Date()
	});
};


$(() => {
	init();

	checkMax();

	let urlInput = $("[data-type=url]");
	let url = urlInput.data('value').replace(/^{baseurl}/i, `${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ''}`);
	urlInput.val(url);
	urlInput.on('focus', function(e) {
		if(this.select) {
		this.select();
		} else if (this.setSelectionRange) {
			this.setSelectionRange(0, this.value.length);
		} else {
			console.log("Hmmmmmmmmm");
		}
	}).trigger('change');

});
