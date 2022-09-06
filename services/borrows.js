const httpStatus = require("http-status");
const { _PrismaClient } = require("../db");
const ApiError = require("../utils/ApiError");
const { formatFilter, formatDate, parseBool } = require("../utils/helpers");

const getBorrows = async (filter) => {
	try {
		filter = formatFilter(filter, {
			createdAt: { k: "gte", f: (s) => new Date(formatDate(s)) },
		});
		const options = {
			orderBy: {
				id: "desc",
			},
			include: {
				resource: true,
				borrower: true,
				authorizedBy: true,
			},
			...(filter && { where: { ...filter } }),
		};
		const borrows = await _PrismaClient.borrow.findMany(options);
		return borrows;
	} catch (error) {
		throw error;
	}
};

const updateBorrow = async (id, key, value) => {
	try {
		const options = {
			where: {
				id: parseInt(id),
			},
			data: {},
		};
		options.data[key] = parseBool(value);
		if (!(await _PrismaClient.borrow.update(options))) {
			return false;
		}
		return true;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getBorrows,
	updateBorrow,
};
