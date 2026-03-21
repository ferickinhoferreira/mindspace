import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("mode") // "sent", "received", "friends"

  try {
    if (mode === "friends") {
      const friends = await prisma.friend.findMany({
        where: {
          OR: [
            { userId: session.user.id, status: "ACCEPTED" },
            { friendId: session.user.id, status: "ACCEPTED" }
          ]
        },
        include: {
          user: { select: { id: true, name: true, image: true, username: true } },
          friend: { select: { id: true, name: true, image: true, username: true } }
        }
      })
      return NextResponse.json(friends)
    }

    const requests = await prisma.friend.findMany({
      where: mode === "sent" 
        ? { userId: session.user.id, status: "PENDING" }
        : { friendId: session.user.id, status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, image: true, username: true } },
        friend: { select: { id: true, name: true, image: true, username: true } }
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { friendId } = await req.json()

    // check existing
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id }
        ]
      }
    })

    if (existing) {
      if (existing.status === "ACCEPTED") return NextResponse.json({ message: "Already friends" })
      return NextResponse.json({ message: "Request already pending" })
    }

    const request = await prisma.friend.create({
      data: {
        userId: session.user.id,
        friendId,
        status: "PENDING"
      }
    })

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { requestId, status } = await req.json() // ACCEPTED, REJECTED (delete)

    if (status === "REJECTED") {
      await prisma.friend.delete({ where: { id: requestId } })
      return NextResponse.json({ message: "Request rejected" })
    }

    const updated = await prisma.friend.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
