// app/api/prompts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const tag = searchParams.get("tag")
  const model = searchParams.get("model")
  const pinned = searchParams.get("pinned")
  const favorite = searchParams.get("favorite")
  const sort = searchParams.get("sort") || "createdAt"
  const order = searchParams.get("order") || "desc"

  const where: Record<string, unknown> = { userId: session.user.id }

  if (category) where.categoryId = category
  if (model) where.model = model
  if (pinned === "true") where.isPinned = true
  if (favorite === "true") where.isFavorite = true
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }
  if (tag) {
    where.tags = { some: { tag: { name: tag } } }
  }

  const prompts = await prisma.prompt.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { [sort]: order },
  })

  return NextResponse.json({ prompts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, content, description, model, categoryId, tagIds } = body

  if (!title || !content) {
    return NextResponse.json({ error: "Título e conteúdo obrigatórios" }, { status: 400 })
  }

  const prompt = await prisma.prompt.create({
    data: {
      title,
      content,
      description,
      model,
      categoryId: categoryId || null,
      userId: session.user.id,
      tags: tagIds?.length
        ? { create: tagIds.map((id: string) => ({ tagId: id })) }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })

  return NextResponse.json({ prompt }, { status: 201 })
}
