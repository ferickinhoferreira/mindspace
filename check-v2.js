import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function check() {
  console.log("Checking User model fields...")
  // @ts-ignore
  console.log("User _count fields:", Object.keys(prisma.user.fields || {}))
  
  console.log("Checking Story model...")
  try {
    // @ts-ignore
    console.log("Story model exists:", !!prisma.story)
  } catch (e) {
    console.log("Story model missing")
  }

  console.log("Checking Republish model...")
  try {
    // @ts-ignore
    console.log("Republish model exists:", !!prisma.republish)
  } catch (e) {
    console.log("Republish model missing")
  }

  await prisma.$disconnect()
}

check()
