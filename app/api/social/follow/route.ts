import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { followingId } = await req.json()
  if (followingId === session.user.id) return NextResponse.json({ error: "Não pode seguir você mesmo" }, { status: 400 })

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: followingId,
      },
    },
  })

  if (existing) {
    await prisma.follow.delete({
      where: { id: existing.id },
    })
    return NextResponse.json({ followed: false })
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: followingId,
    },
  })

  return NextResponse.json({ followed: true })
}
