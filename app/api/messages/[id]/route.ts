import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET Messages for a specific conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: { select: { name: true, image: true, id: true } },
      sharedThought: {
        include: {
          user: { select: { name: true, image: true, id: true } }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  return NextResponse.json({ messages })
}
