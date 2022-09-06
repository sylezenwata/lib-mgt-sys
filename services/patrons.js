const { _PrismaClient } = require("../db");
const { formatFilter, formatDate } = require("../utils/helpers");

const getPatrons = async (filter) => {
	try {
		filter = formatFilter(filter, {
			createdAt: { k: "gte", f: (s) => new Date(formatDate(s)) },
		});
		const options = {
			orderBy: {
				id: "desc",
			},
			include: {
				createdBy: true,
			},
			...(filter && { where: { ...filter } }),
		};
		const patrons = await _PrismaClient.patron.findMany(options);
		return patrons;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getPatrons,
};
