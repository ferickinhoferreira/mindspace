// app/api/diag/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diag = {
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET ? "Present" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL ? "Present" : "MISSING",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Present" : "MISSING",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "Present" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || "nodejs",
    },
    database: "checking...",
    counts: {
      users: 0,
      tokens: 0,
    },
    recentUsers: [] as any[],
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    diag.database = "CONNECTED"
    diag.counts.users = await prisma.user.count()
    diag.counts.tokens = await prisma.verificationToken.count()
    diag.recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { email: true, name: true, emailVerified: true, createdAt: true }
    })
  } catch (e: any) {
    diag.database = `ERROR: ${e.message}`
  }

  return NextResponse.json(diag)
}
