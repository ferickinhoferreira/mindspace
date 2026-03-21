import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get("conversationId")

  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 })

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId } as any,
      include: {
        sender: { select: { id: true, name: true, image: true } },
        thought: { select: { id: true, content: true } } // for shared posts
      } as any,
      orderBy: { createdAt: "asc" } as any
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { conversationId, content, thoughtId } = await req.json()

    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        senderId: session.user.id,
        thoughtId // optional shared post
      } as any,
      include: {
        sender: { select: { id: true, name: true, image: true } }
      } as any
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
