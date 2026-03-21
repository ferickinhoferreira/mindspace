import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Friends are people who follow each other or just everyone the user follows for sharing?
  // Let's get everyone the user follows as potential share targets
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    include: {
      following: { select: { id: true, name: true, image: true } }
    }
  })

  const friends = following.map(f => f.following)

  return NextResponse.json({ friends })
}
