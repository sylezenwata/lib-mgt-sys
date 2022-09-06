const { _PrismaClient } = require("../db");
const bcryptJs = require("bcryptjs");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { parseBool } = require("../utils/helpers");

const create = async (req, res, next) => {
	try {
		const {
			firstName,
			lastName,
			otherNames = null,
			email,
			gender,
			password,
		} = req.body;
		if (res.locals.session.owner.rank !== "super") {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Only a super admin can add a staff"
			);
		}
		const salt = await bcryptJs.genSalt(12);
		const hashedPassword = await bcryptJs.hash(password, salt);
		if (
			!(await _PrismaClient.staff.create({
				data: {
					firstName,
					lastName,
					otherNames,
					email,
					password: hashedPassword,
					gender,
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred adding staff"
			);
		}
		res.status(httpStatus.CREATED).send("Staff was added");
	} catch (error) {
		if (error.code === "P2002") {
			error.message = "Email already exists";
		}
		next(error);
	}
};

const update = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { key, value } = req.body;
		if (res.locals.session.owner.rank !== "super") {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Only a super admin can ban a staff"
			);
		}
		if (parseInt(id) === res.locals.session.owner.id) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Super admin cannot be banned"
			);
		}
		const options = {
			where: {
				id: parseInt(id),
			},
			data: {},
		};
		options.data[key] = parseBool(value);
		if (!(await _PrismaClient.staff.update(options))) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred updating staff"
			);
		}
		res.send("Staff was updated");
	} catch (error) {
		next(error);
	}
};

module.exports = {
	create,
	update,
};
