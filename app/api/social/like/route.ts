import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { thoughtId, promptId } = await req.json()

  if (thoughtId) {
    const existing = await prisma.like.findUnique({
      where: { userId_thoughtId: { userId: session.user.id, thoughtId } },
    })
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    }
    await prisma.like.create({ data: { userId: session.user.id, thoughtId } })
    return NextResponse.json({ liked: true })
  }

  if (promptId) {
    const existing = await prisma.like.findUnique({
      where: { userId_promptId: { userId: session.user.id, promptId } },
    })
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    }
    await prisma.like.create({ data: { userId: session.user.id, promptId } })
    return NextResponse.json({ liked: true })
  }

  return NextResponse.json({ error: "Invalid target" }, { status: 400 })
}
