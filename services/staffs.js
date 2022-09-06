const { _PrismaClient } = require("../db");
const _ = require("lodash");
const { formatFilter, formatDate } = require("../utils/helpers");

const getStaffs = async (filter) => {
	try {
		filter = formatFilter(filter, {
			createdAt: { k: "gte", f: (s) => new Date(formatDate(s)) },
		});
		const options = {
			orderBy: {
				id: "desc",
			},
			...(filter && { where: { ...filter } }),
		};
		const staffs = await _PrismaClient.staff.findMany(options);
		staffs.map((staff) => _.unset(staff, "password"));
		return staffs;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getStaffs,
};
