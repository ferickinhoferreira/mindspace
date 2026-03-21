import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET Conversations for the current user
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { id: session.user.id } }
    },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  return NextResponse.json({ conversations })
}

// SEND a new message or start a conversation
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { recipientId, content, conversationId, sharedThoughtId } = await req.json()

  let convId = conversationId

  // 1. If no conversationId, check if one exists or create it
  if (!convId && recipientId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: session.user.id } } },
          { participants: { some: { id: recipientId } } }
        ]
      }
    })

    if (existing) {
      convId = existing.id
    } else {
      const created = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: session.user.id }, { id: recipientId }]
          }
        }
      })
      convId = created.id
    }
  }

  if (!convId) return NextResponse.json({ error: "Recipient or Conversation required" }, { status: 400 })

  // 2. Create the message
  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      conversationId: convId,
      sharedThoughtId: sharedThoughtId || null
    },
    include: {
      sender: { select: { name: true, image: true, id: true } },
      sharedThought: {
        include: {
          user: { select: { name: true, image: true, id: true } }
        }
      }
    }
  })

  // 3. Update conversation timestamp
  await prisma.conversation.update({
    where: { id: convId },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json({ message })
}
