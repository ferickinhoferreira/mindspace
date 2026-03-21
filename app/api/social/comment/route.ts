import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const thoughtId = searchParams.get("thoughtId")
  const promptId = searchParams.get("promptId")

  if (!thoughtId && !promptId) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 })
  }

  const where: any = {}
  if (thoughtId) where.thoughtId = thoughtId
  if (promptId) where.promptId = promptId
  
  // RETURN FLAT LIST FOR FRONTEND TREE BUILDING
  try {
    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { name: true, image: true, id: true } },
      } as any,
      orderBy: { createdAt: "asc" }, // Ascending so parent comes before child usually, though we process it anyway
    })

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, thoughtId, promptId, parentCommentId, mediaUrl, mediaType } = await req.json()

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        thoughtId: thoughtId || null,
        promptId: promptId || null,
        parentCommentId: parentCommentId || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      } as any,
      include: {
        user: { select: { name: true, image: true, id: true } },
      },
    })
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { commentId, likedByCreator } = await req.json()

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { 
        thought: { select: { userId: true } },
        prompt: { select: { userId: true } }
      }
    })

    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 })

    const isAuthor = (comment.thought?.userId === session.user.id) || (comment.prompt?.userId === session.user.id)
    if (!isAuthor) return NextResponse.json({ error: "Only post author can heart comments" }, { status: 403 })

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { likedByCreator: likedByCreator } as any,
    })

    return NextResponse.json({ comment: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}
