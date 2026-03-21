import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const thoughtId = searchParams.get("thoughtId")
  const promptId = searchParams.get("promptId")

  const where: any = {}
  if (thoughtId) where.thoughtId = thoughtId
  if (promptId) where.promptId = promptId

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: { select: { name: true, image: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, thoughtId, promptId } = await req.json()

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id,
      thoughtId: thoughtId || null,
      promptId: promptId || null,
    },
    include: {
      user: { select: { name: true, image: true, id: true } },
    },
  })

  return NextResponse.json({ comment })
}
