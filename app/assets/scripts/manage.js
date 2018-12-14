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
};

$(() => {
	init();
});