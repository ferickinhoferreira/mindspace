// app/api/diag/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diag = {
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET ? "Present (Hidden)" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "Present (Hidden)" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || "nodejs",
    },
    database: "checking...",
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    diag.database = "CONNECTED"
  } catch (e: any) {
    diag.database = `ERROR: ${e.message}`
  }

  return NextResponse.json(diag)
}
