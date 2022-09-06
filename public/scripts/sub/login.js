import { set as $ } from "../../../node_modules/set/src/index.js";
import { innerNotify } from "../modules.js";

// login form
$("form").on("submit", function (e) {
	e.preventDefault();
	const $this = $(this);
	innerNotify();
	const [emailInput, passwordInput] = [
		...$this.find("[name=email], [name=password]")[0],
	];
	const email = emailInput.value;
	const password = passwordInput.value;
	$this.disableForm();
	$.ajax({
		url: $this.attr("action")[0],
		method: $this.attr("method")[0],
		body: { email, password },
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	})
		.then((res) => {
			innerNotify(res, "success");
			window.location.href = "/admin/home";
		})
		.catch((err) => {
			const response = err.response ? JSON.parse(err.response) : null;
			const msg = response?.message || err.message || "Network error";
			innerNotify(msg, "error");
			$this.disableForm(true);
		});
});
