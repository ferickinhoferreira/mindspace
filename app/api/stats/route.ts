// app/api/stats/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const [
    totalThoughts,
    totalPrompts,
    totalTags,
    totalCategories,
    thoughtsByType,
    recentThoughts,
    recentPrompts,
    mostUsedPrompts,
    pinnedThoughts,
    pinnedPrompts,
  ] = await Promise.all([
    prisma.thought.count({ where: { userId } }),
    prisma.prompt.count({ where: { userId } }),
    prisma.tag.count({ where: { userId } }),
    prisma.category.count({ where: { userId } }),
    prisma.thought.groupBy({
      by: ["type"],
      where: { userId },
      _count: true,
    }),
    prisma.thought.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.prompt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.prompt.findMany({
      where: { userId, useCount: { gt: 0 } },
      orderBy: { useCount: "desc" },
      take: 3,
      include: { category: true },
    }),
    prisma.thought.count({ where: { userId, isPinned: true } }),
    prisma.prompt.count({ where: { userId, isPinned: true } }),
  ])

  return NextResponse.json({
    stats: {
      totalThoughts,
      totalPrompts,
      totalTags,
      totalCategories,
      pinnedThoughts,
      pinnedPrompts,
    },
    thoughtsByType,
    recentThoughts,
    recentPrompts,
    mostUsedPrompts,
  })
}
