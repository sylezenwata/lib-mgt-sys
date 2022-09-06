const { _PrismaClient } = require("../db");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { parseBool } = require("../utils/helpers");

const create = async (req, res, next) => {
	try {
		const {
			author,
			category,
			edition,
			isbn,
			publishedYear,
			quantity,
			title,
			price,
		} = req.body;
		if (
			!(await _PrismaClient.record.create({
				data: {
					author,
					category,
					edition,
					isbn,
					publishedYear,
					quantity: parseInt(quantity),
					price,
					title,
					createdById: res.locals.session.owner.id,
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred adding record"
			);
		}
		res.status(httpStatus.CREATED).send("record was added");
	} catch (error) {
		if (error.code === "P2002") {
			error.message = "ISBN already exists";
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
		if (!(await _PrismaClient.record.update(options))) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred updating record"
			);
		}
		res.send("record was updated");
	} catch (error) {
		next(error);
	}
};

module.exports = {
	create,
	update,
};
