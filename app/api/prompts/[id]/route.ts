// app/api/prompts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prompt = await prisma.prompt.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { category: true, tags: { include: { tag: true } } },
  })

  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ prompt })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, content, description, model, categoryId, isPinned, isFavorite, tagIds, incrementUse } = body

  const existing = await prisma.prompt.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (tagIds !== undefined) {
    await prisma.promptTag.deleteMany({ where: { promptId: params.id } })
  }

  const prompt = await prisma.prompt.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(description !== undefined && { description }),
      ...(model !== undefined && { model }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(incrementUse && { useCount: { increment: 1 } }),
      ...(tagIds !== undefined && tagIds.length > 0 && {
        tags: { create: tagIds.map((id: string) => ({ tagId: id })) },
      }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json({ prompt })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.prompt.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.prompt.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
