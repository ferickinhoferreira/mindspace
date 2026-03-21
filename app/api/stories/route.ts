import { NextResponse } from "next/server"
// app/api/stories/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { addHours } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get active stories (not expired) from following and me
  const userId = session.user.id
  
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  })
  const followingIds = following.map(f => f.followingId)
  followingIds.push(userId)

  const stories = await prisma.story.findMany({
    where: {
      userId: { in: followingIds },
      expiresAt: { gt: new Date() }
    },
    include: {
      user: { select: { name: true, image: true, id: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ stories })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { mediaUrl, mediaType } = await req.json()
  if (!mediaUrl) return NextResponse.json({ error: "Media URL is required" }, { status: 400 })

  const story = await prisma.story.create({
    data: {
      userId: session.user.id,
      mediaUrl,
      mediaType: mediaType || "image",
      expiresAt: addHours(new Date(), 24)
    }
  })

  return NextResponse.json({ story })
}
