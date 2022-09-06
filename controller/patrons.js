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
			email = null,
			phone,
			dateOfBirth,
			gender,
			address,
			type,
			profession,
			idType,
			idNumber,
		} = req.body;
		if (
			!(await _PrismaClient.patron.create({
				data: {
					firstName,
					lastName,
					otherNames,
					email,
					phone,
					dateOfBirth: new Date(dateOfBirth),
					gender,
					address,
					type,
					profession,
					idType,
					idNumber,
					createdById: res.locals.session.owner.id,
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred adding patron"
			);
		}
		res.status(httpStatus.CREATED).send("patron was added");
	} catch (error) {
		if (error.code === "P2002") {
			error.message = "Email or phone already exists";
		}
		next(error);
	}
};

const update = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { key, value } = req.body;
		const options = {
			where: {
				id: parseInt(id),
			},
			data: {},
		};
		options.data[key] = parseBool(value);
		if (!(await _PrismaClient.patron.update(options))) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred updating patron"
			);
		}
		res.send("patron was updated");
	} catch (error) {
		next(error);
	}
};

module.exports = {
	create,
	update,
};
