import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// EDIT POST
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, isPublic, isArchived } = await req.json()

  const thought = await prisma.thought.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!thought) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (thought.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.thought.update({
    where: { id },
    data: {
      title,
      content,
      isPublic,
      isArchived: !!isArchived
    }
  })

  return NextResponse.json({ thought: updated })
}

// DELETE POST
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const thought = await prisma.thought.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!thought) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (thought.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.thought.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
