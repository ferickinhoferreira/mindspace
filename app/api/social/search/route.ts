import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q) {
    return NextResponse.json({ users: [], thoughts: [] })
  }

  try {
    const [users, thoughts] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        } as any,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          _count: { select: { followers: true } }
        } as any,
        take: 10,
      }),
      prisma.thought.findMany({
        where: {
          content: { contains: q, mode: "insensitive" },
          isPublic: true,
          isArchived: false,
        } as any,
        include: {
          user: { select: { id: true, name: true, username: true, image: true } } as any,
          _count: { select: { likes: true, comments: true, republishes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    ])

    return NextResponse.json({ users, thoughts })
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
