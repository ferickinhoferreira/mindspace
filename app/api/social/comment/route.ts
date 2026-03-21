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
  
  // By default, only get top-level comments if not specified
  // but for social feed we usually want them all and nest them in frontend
  // or get them with replies.
  
  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: { select: { name: true, image: true, id: true } },
      replies: {
        include: {
          user: { select: { name: true, image: true, id: true } },
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, thoughtId, promptId, parentCommentId, mediaUrl, mediaType } = await req.json()

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id,
      thoughtId: thoughtId || null,
      promptId: promptId || null,
      parentCommentId: parentCommentId || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
    },
    include: {
      user: { select: { name: true, image: true, id: true } },
    },
  })

  return NextResponse.json({ comment })
}

// TOGGLE CREATOR HEART
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { commentId, likedByCreator } = await req.json()

  // Verify if the current user is the author of the post associated with this comment
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
    data: { likedByCreator: likedByCreator },
  })

  return NextResponse.json({ comment: updated })
}
