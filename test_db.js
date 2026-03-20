const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("DB connection successful");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (e) {
    console.error("DB connection failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
