"use strict";

$(function() {
	console.log("data-dialog");
	$("[data-dialog]").each(function(i) {
		let dialogId = $(this).data("dialog");
		console.log(`initialize ${dialogId}`);

		$(this).click(function() {
			let dialog = $(`#${dialogId}`).get(0);
			if(dialog) {
				if(dialogPolyfill) {
					dialogPolyfill.registerDialog(dialog);
				}
				console.log(dialog);
				dialog.showModal();
			}
		});
	});


	$("dialog button.close").click(function() {
		let dialog = $(this).closest("dialog").get(0);
		if(dialog) {
			dialog.close();
		} else {
			console.error("this shit doesn't work");
		}
	});
});
