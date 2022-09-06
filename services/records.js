const { _PrismaClient } = require("../db");
const { formatFilter, formatDate } = require("../utils/helpers");

const getRecords = async (filter) => {
	try {
		filter = formatFilter(filter, {
			id: {
				k: "equals",
				f: parseInt,
			},
			price: {
				k: "gte",
			},
			createdAt: {
				k: "gte",
				f: (s) => new Date(formatDate(s)),
			},
		});
		const options = {
			orderBy: {
				id: "desc",
			},
			include: {
				createdBy: true,
				borrows: {
					where: {
						returned: false,
					},
				},
			},
			...(filter && { where: { ...filter } }),
		};
		const records = await _PrismaClient.record.findMany(options);
		return records;
	} catch (error) {
		throw error;
	}
};

const searchRecords = async (query) => {
	try {
		query = query.toString().trim();
		const options = {
			where: {
				OR: [
					{
						isbn: {
							contains: query,
						},
					},
					{
						title: {
							contains: query,
						},
					},
					{
						author: {
							contains: query,
						},
					},
					{
						publishedYear: {
							contains: query,
						},
					},
					{
						category: {
							contains: query,
						},
					},
				],
				blacklisted: false,
			},
			orderBy: {
				id: "desc",
			},
			include: {
				borrows: {
					where: {
						returned: false,
					},
				},
			},
		};
		const records = await _PrismaClient.record.findMany(options);
		return records;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getRecords,
	searchRecords,
};
