import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { id: session.user.id } }
      },
      include: {
        participants: {
          select: { id: true, name: true, username: true, image: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { targetUserId } = await req.json()

    // check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: session.user.id } } },
          { participants: { some: { id: targetUserId } } }
        ]
      }
    })

    if (existing) return NextResponse.json(existing)

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: session.user.id }, { id: targetUserId }]
        }
      }
    })

    return NextResponse.json(conversation)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
