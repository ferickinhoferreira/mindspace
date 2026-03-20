import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "personal" // personal, explore, trending
  const userId = session.user.id

  if (type === "personal") {
    // Get users I follow
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)

    const thoughts = await prisma.thought.findMany({
      where: {
        OR: [
          { userId: { in: followingIds }, isPublic: true },
          { userId: userId }, // Always show my own
        ],
      },
      include: {
        user: { select: { name: true, image: true, id: true } },
        likes: { where: { userId } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ thoughts })
  }

  if (type === "explore") {
    const thoughts = await prisma.thought.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true, image: true, id: true } },
        likes: { where: { userId } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    })
    return NextResponse.json({ thoughts })
  }

  if (type === "trending") {
     const thoughts = await prisma.thought.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true, image: true, id: true } },
        likes: { where: { userId } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        likes: { _count: "desc" },
      },
      take: 10,
    })
    return NextResponse.json({ thoughts })
  }

  return NextResponse.json({ error: "Invalid feed type" }, { status: 400 })
}
