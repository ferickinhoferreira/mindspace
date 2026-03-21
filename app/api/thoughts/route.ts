// app/api/thoughts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const search = searchParams.get("search")
  const tag = searchParams.get("tag")
  const pinned = searchParams.get("pinned")
  const favorite = searchParams.get("favorite")
  const sort = searchParams.get("sort") || "createdAt"
  const order = searchParams.get("order") || "desc"

  const where: Record<string, unknown> = { userId: session.user.id }

  if (type && type !== "ALL") where.type = type
  if (pinned === "true") where.isPinned = true
  if (favorite === "true") where.isFavorite = true
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ]
  }
  if (tag) {
    where.tags = { some: { tag: { name: tag } } }
  }

  const thoughts = await prisma.thought.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { [sort]: order },
  })

  return NextResponse.json({ thoughts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, content, type, mediaUrl, mediaType, isPinned, isFavorite, tagIds, isPublic } = body

  if (!content) return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 })

  const thought = await prisma.thought.create({
    data: {
      title,
      content,
      type: type || "POST",
      mediaUrl,
      mediaType,
      isPublic: isPublic ?? false,
      userId: session.user.id,
      tags: tagIds?.length
        ? { create: tagIds.map((id: string) => ({ tagId: id })) }
        : undefined,
    },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json({ thought }, { status: 201 })
}
