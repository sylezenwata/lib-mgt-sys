const { PrismaClient } = require("@prisma/client");
const bcryptJs = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
	const password = "123456";
	const salt = await bcryptJs.genSalt(12);
	const hashedPassword = await bcryptJs.hash(password, salt);
	const newStaff = await prisma.staff.create({
		data: {
			email: "admin@gmail.com",
			password: hashedPassword,
			gender: "Male",
			firstName: "Admin",
			lastName: "Admin",
			otherNames: null,
			rank: "super",
		},
	});
	console.log("<=== Super Admin Login Credentials ===>");
	console.log("Email: ", newStaff.email);
	console.log("Password: ", password);
	// const tokens = await prisma.token.findMany({
	// 	where: {
	// 		ownerId: 1
	// 	},
	// 	include: {
	// 		owner: true
	// 	}
	// })
	// console.log(tokens);
	// const query = "computer"
	// const options = {
	// 	where: {
	// 		OR: [
	// 			{
	// 				isbn: {
	// 					contains: query.toString().trim(),
	// 				},
	// 			},
	// 			{
	// 				title: {
	// 					contains: query.toString().trim(),
	// 				},
	// 			},
	// 			{
	// 				author: {
	// 					contains: query.toString().trim(),
	// 				},
	// 			},
	// 			{
	// 				publishedYear: {
	// 					contains: query.toString().trim(),
	// 				},
	// 			},
	// 			{
	// 				category: {
	// 					contains: query.toString().trim(),
	// 				},
	// 			},
	// 		],
	// 		blacklisted: false,
	// 	},
	// 	orderBy: {
	// 		id: "desc",
	// 	},
	// 	include: {
	// 		createdBy: true,
	// 		borrows: true,
	// 		_count: {
	// 			select: {
	// 				borrows: true,
	// 			},
	// 		},
	// 	},
	// };
	// const records = await prisma.record.findMany(options);
	// console.log(records);
	
}

main()
	.catch((e) => console.log(e))
	.finally(async () => await prisma.$disconnect());
