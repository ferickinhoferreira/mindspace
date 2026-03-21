import { NextResponse } from "next/server"
// app/api/social/republish/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { thoughtId } = await req.json()
  if (!thoughtId) return NextResponse.json({ error: "Thought ID is required" }, { status: 400 })

  const userId = session.user.id

  const existing = await prisma.republish.findUnique({
    where: { userId_thoughtId: { userId, thoughtId } },
  })

  if (existing) {
    await prisma.republish.delete({ where: { id: existing.id } })
    return NextResponse.json({ republished: false })
  }

  await prisma.republish.create({
    data: { userId, thoughtId },
  })

  return NextResponse.json({ republished: true })
}
