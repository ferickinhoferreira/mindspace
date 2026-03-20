import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        banner: true,
        bio: true,
        _count: {
          select: { followers: true, following: true },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const thoughts = await prisma.thought.findMany({
      where: { userId: id, isPublic: true },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    let isFollowing = false
    if (userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: id,
          },
        },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({ user, thoughts, isFollowing })
  } catch (error) {
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 })
  }
}
