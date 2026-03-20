// app/api/thoughts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const thought = await prisma.thought.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { tags: { include: { tag: true } } },
  })

  if (!thought) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ thought })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, content, type, color, isPinned, isFavorite, tagIds } = body

  const existing = await prisma.thought.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Handle tag updates
  if (tagIds !== undefined) {
    await prisma.thoughtTag.deleteMany({ where: { thoughtId: params.id } })
  }

  const thought = await prisma.thought.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(type !== undefined && { type }),
      ...(color !== undefined && { color }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(tagIds !== undefined && tagIds.length > 0 && {
        tags: { create: tagIds.map((id: string) => ({ tagId: id })) },
      }),
    },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json({ thought })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.thought.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.thought.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
