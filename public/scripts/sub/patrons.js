import { set as $ } from "../../../node_modules/set/src/index.js";
import { innerNotify } from "../modules.js";

import "../main.js";

// create patron
$("#createPatronForm").on("submit", function (e) {
	e.preventDefault();
	const $this = $(this);
	innerNotify();
	let inputs = $("#createPatronForm [name]");
	inputs = inputs
		.filter((e) => e.name !== "confirmPassword")
		.reduce((obj, input) => {
			obj[input.name] = input.value.trim() === "" ? null : input.value.trim();
			return obj;
		}, {});
	$this.disableForm();
	$.ajax({
		url: $this.attr("action")[0],
		method: $this.attr("method")[0],
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
		body: inputs,
	})
		.then((res) => {
			innerNotify(res, "success");
			window.location.reload();
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			innerNotify(msg, "error");
			$this.disableForm(true);
		});
});

$(document).on("click", "[data-patron-ban]", (e) => {
	const target = $(e.target);
	const body = {
		key: "blacklisted",
		value: target.attr("data-patron-ban")[0],
	};
	const patronId = target.parent("tr[data-item-id]").attr("data-item-id")[0];
  target[0].disabled = true;
	$.ajax({
		url: `/admin/patrons/${patronId}/update`,
		method: "PATCH",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
		body,
	})
		.then((res) => {
			alert(res);
			window.location.reload();
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			alert(msg);
      target[0].disabled = false;
		});
});
