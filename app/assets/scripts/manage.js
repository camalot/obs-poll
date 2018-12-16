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

		console.log("add item");
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
		console.log(source);
		console.log(source.data("enabled"));
		$.ajax(url, {
			method: "post",
			data: {
				id: source.data("id"),
				channel: source.data("channel"),
				enabled: source.data("enabled") === "true"
			},
			success: (data, status, xhr) => {
				console.log(data);
				console.log($(`[data-action="poll-state"][data-enabled="false"][data-id="${data.id}]`));
				if(data) {
					$(`[data-action="poll-state"][data-enabled="false"][data-id="${data.id}"]`).attr("disabled", !data.enabled);
					$(`[data-action="poll-state"][data-enabled="true"][data-id="${data.id}"]`).attr("disabled", data.enabled);
				}
			},
			complete: (xhr, status) => {
				console.log(status);
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

let init = function (base) {
	$("[data-action]", $(base || document))
		.on("click", function (e) {
			let action = $(this).data("action");
			if (actions[action]) {
				actions[action](this);
			}
		});

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

});
