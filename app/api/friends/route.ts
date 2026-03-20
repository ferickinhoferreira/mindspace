import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "friends"

  if (type === "requests") {
    const requests = await prisma.friend.findMany({
      where: { friendId: session.user.id, status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })
    return NextResponse.json({ requests })
  }

  const friends = await prisma.friend.findMany({
    where: {
      OR: [
        { userId: session.user.id, status: "ACCEPTED" },
        { friendId: session.user.id, status: "ACCEPTED" },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      friend: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  // Format to return just the other user
  const formatted = friends.map((f) => (f.userId === session.user.id ? f.friend : f.user))

  return NextResponse.json({ friends: formatted })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email } = await req.json()

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  if (targetUser.id === session.user.id) return NextResponse.json({ error: "Você não pode ser seu próprio amigo" }, { status: 400 })

  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: targetUser.id },
        { userId: targetUser.id, friendId: session.user.id },
      ],
    },
  })

  if (existing) return NextResponse.json({ error: "Solicitação já existe ou vocês já são amigos" }, { status: 400 })

  const request = await prisma.friend.create({
    data: { userId: session.user.id, friendId: targetUser.id, status: "PENDING" },
  })

  return NextResponse.json({ request })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status } = await req.json() // id is Friend record ID

  const request = await prisma.friend.findUnique({ where: { id } })
  if (!request || request.friendId !== session.user.id) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const updated = await prisma.friend.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ updated })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json() // Friend record ID

  await prisma.friend.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
