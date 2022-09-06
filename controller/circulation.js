const { _PrismaClient } = require("../db");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { parseBool } = require("../utils/helpers");
const { updateBorrow } = require("../services/borrows");

const checkOut = async (req, res, next) => {
	try {
		const { resourceId, borrower, returnAt } = req.body;
		const getBorrower = await _PrismaClient.patron.findFirst({
			where: {
				email: borrower,
				blacklisted: false,
			},
		});
		if (!getBorrower || getBorrower?.blacklisted === true) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Patron does not exist or has been banned"
			);
		}
		if (
			!(await _PrismaClient.borrow.create({
				data: {
					resourceId: parseInt(resourceId),
					borrowerId: getBorrower.id,
					authorizedById: res.locals.session.owner.id,
					returnAt: new Date(returnAt),
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred authorizing check out"
			);
		}
		res.status(httpStatus.CREATED).send("Check out was authorized");
	} catch (error) {
		next(error);
	}
};

const update = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { key, value } = req.body;
		if (!(await updateBorrow(id, key, value))) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred confirming return"
			);
		}
		res.send("Resource return has been confirmed");
	} catch (error) {
		next(error);
	}
};

module.exports = {
	checkOut,
	update,
};
