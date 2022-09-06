const { _PrismaClient } = require("../db");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { stringHashMatch } = require("../utils/helpers");
const uuid4 = require("uuid4");
const moment = require("moment");
const config = require("../config/env");
const { _logout, _redirect } = require("../middlewares/auth");

const login = async (req, res, next) => {
	try {
		const { reqIp } = req.custom;
		const { email, password } = req.body;
		const validUser = await _PrismaClient.staff.findUnique({
			where: {
				email,
			},
		});
		if (!validUser || !(await stringHashMatch(password, validUser.password))) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Incorrect login credentials"
			);
		}
		if (validUser.blacklisted !== false) {
			throw new ApiError(
				httpStatus.FORBIDDEN,
				"Your account has been suspended"
			);
		}
		// set session token
		const token = uuid4();
		const expires = new Date(
			moment().add(config.token.sessionExpiryHours, "hours")
		);
		if (
			!(await _PrismaClient.token.create({
				data: {
					token,
					type: "login_session",
					ownerId: validUser.id,
					reqIp,
					expiresAt: expires,
				},
			}))
		) {
			throw new Error("Internal server error");
		}
		res.cookie("sessionAuth", `${token}`, {
			expires,
			httpOnly: true,
		});
		res.send("Login successful. Redirecting...");
	} catch (error) {
		next(error);
	}
};

const logout = async (req, res, next) => {
	try {
		await _PrismaClient.token.delete({
			where: {
				id: res.locals.session.id,
			},
		});
		_logout(res);
		_redirect(req, res);
	} catch (error) {
		res.redirect("/error");
	}
};

module.exports = {
	login,
	logout,
};
