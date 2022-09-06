const express = require("express");
const AuthController = require("../controller/auth");
const config = require("../config/env");
const { valSession } = require("../middlewares/auth");
const { formatDate } = require("../utils/helpers");
const { getStaffs } = require("../services/staffs");
const staffsController = require("../controller/staffs");
const { getPatrons } = require("../services/patrons");
const patronsController = require("../controller/patrons");
const { getRecords, searchRecords } = require("../services/records");
const acquisitionController = require("../controller/acquisition");
const { getBorrows, updateBorrow } = require("../services/borrows");
const circulationController = require("../controller/circulation");
const cron = require("node-cron");
const moment = require("moment");

// router init
const router = express.Router();

// start cron job
cron.schedule("*/5 * * * *", async () => {
	try {
		let filter = "returned=false,is-due=false";
		const borrows = await getBorrows(filter);
		borrows.forEach((borrow) => {
			if (moment().isAfter(borrow.returnAt)) {
				updateBorrow(borrow.id, "isDue", "true");
			}
		});
	} catch (error) {
		console.log(error);
	}
});


// <== landing ==>
// opac
router.get("/", async (req, res, next) => {
	try {
		const { search = null } = req.query;
		let records = [];
		if (search) {
			records = await searchRecords(search);
		}
		const data = {
			appName: config.appName,
			head: {
				title: `OPAC | ${config.appName}`,
			},
			nav: {
				title: "Online Public Access Catalog (OPAC)",
			},
			appVersion: config.appVersion,
			records,
			search,
		};
		res.render("index.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});


// <== auth ==>
// index page
router.get("/admin", valSession(false), async (req, res) => {
	try {
		if (res.locals.session) {
			res.redirect("/admin/home");
			return;
		}
		const data = {
			appName: config.appName,
			head: {
				title: `${config.appName} Admin Login`,
			},
			appVersion: config.appVersion,
		};
		res.render("login.ejs", { data });
	} catch (error) {
		res.redirect("/error");
	}
});

// login
router.post("/admin/login", AuthController.login);

// logout
router.get("/admin/logout", valSession(true), AuthController.logout);


// <== home ==>
// home
router.get("/admin/home", valSession(true), async (req, res) => {
	try {
		const data = {
			appName: config.appName,
			head: {
				title: `Home | ${config.appName}`,
			},
			appVersion: config.appVersion,
			user: res.locals.session.owner,
		};
		res.render("home.ejs", { data });
	} catch (error) {
		res.redirect("/error");
	}
});

// <== staff ==>
// staffs
router.get("/admin/staffs", valSession(true), async (req, res, next) => {
	try {
		const { filter = null } = req.query;
		const staffs = await getStaffs(filter);
		const data = {
			appName: config.appName,
			head: {
				title: `Staffs | ${config.appName}`,
			},
			nav: {
				title: "Staffs",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			staffs,
			formatDate,
			filter,
		};
		res.render("staffs.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// create staff
router.post("/admin/staffs/create", valSession(true), staffsController.create);

// update staff
router.patch("/admin/staffs/:id/update", valSession(true), staffsController.update);

// <== patron ==>
// patrons
router.get("/admin/patrons", valSession(true), async (req, res, next) => {
	try {
		const { filter = null } = req.query;
		const patrons = await getPatrons(filter);
		const data = {
			appName: config.appName,
			head: {
				title: `Patrons | ${config.appName}`,
			},
			nav: {
				title: "Patrons",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			patrons,
			formatDate,
			filter,
		};
		res.render("patrons.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// create patron
router.post("/admin/patrons/create", valSession(true), patronsController.create);

// update patron
router.patch("/admin/patrons/:id/update", valSession(true), patronsController.update);

// <== acquisition ==>
// records
router.get("/admin/acquisition", valSession(true), async (req, res, next) => {
	try {
		const { filter = null } = req.query;
		const records = await getRecords(filter);
		const data = {
			appName: config.appName,
			head: {
				title: `Acquisition | ${config.appName}`,
			},
			nav: {
				title: "Acquisition Unit",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			records,
			formatDate,
			filter,
		};
		res.render("acquisition.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// create record
router.post(
	"/admin/acquisition/create",
	valSession(true),
	acquisitionController.create
);

// update record
router.patch(
	"/admin/acquisition/:id/update",
	valSession(true),
	acquisitionController.update
);

// <== stack ==>
// stacks
router.get("/admin/stacks", valSession(true), async (req, res, next) => {
	try {
		const { filter = null } = req.query;
		const newfilter = (filter ? filter + "," : "") + "returned=false";
		const borrows = await getBorrows(newfilter);
		const data = {
			appName: config.appName,
			head: {
				title: `Stacks | ${config.appName}`,
			},
			nav: {
				title: "Stack Unit",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			borrows,
			formatDate,
			filter,
		};
		res.render("stacks.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// <== catalogue ==>
// catalogue
router.get("/admin/catalogue", valSession(true), async (req, res, next) => {
	try {
		const { search = null } = req.query;
		let records = [];
		if (search) {
			records = await searchRecords(search);
		}
		const data = {
			appName: config.appName,
			head: {
				title: `Catalogue | ${config.appName}`,
			},
			nav: {
				title: "Catalogue Unit",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			records,
			formatDate,
			search,
		};
		res.render("catalogue.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// <== circulation ==>
// circulation
router.get("/admin/circulation", valSession(true), async (req, res, next) => {
	try {
		const { filter = null, resourceId = null } = req.query;
		let resource = null;
		if (resourceId) {
			resource = await getRecords(`id=${resourceId}`);
		}
		const borrows = await getBorrows(filter);
		const data = {
			appName: config.appName,
			head: {
				title: `Circulation | ${config.appName}`,
			},
			nav: {
				title: "Circulation Unit",
			},
			appVersion: config.appVersion,
			returnUrl: "/admin/home",
			user: res.locals.session.owner,
			borrows,
			formatDate,
			filter,
			resource,
		};
		res.render("circulation.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// check out (loan)
router.post(
	"/admin/circulation/checkOut",
	valSession(true),
	circulationController.checkOut
);

// update borrows
router.patch(
	"/admin/circulation/:id/update",
	valSession(true),
	circulationController.update
);

// <== error ==>
// error
router.get("/error", async (req, res) => {
	const data = {
		appName: config.appName,
		head: {
			title: `Error | ${config.appName}`,
		},
		body: {
			message: "Internal server error",
		},
		appVersion: config.appVersion,
	};
	res.render("error.ejs", { data });
});

module.exports = router;
