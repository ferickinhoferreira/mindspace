import { NextResponse } from "next/server"
// app/api/social/save/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { thoughtId } = await req.json()
  if (!thoughtId) return NextResponse.json({ error: "Thought ID is required" }, { status: 400 })

  const userId = session.user.id

  const existing = await prisma.save.findUnique({
    where: { userId_thoughtId: { userId, thoughtId } },
  })

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false })
  }

  await prisma.save.create({
    data: { userId, thoughtId },
  })

  return NextResponse.json({ saved: true })
}
