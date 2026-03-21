import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true,
      name: true, 
      bio: true, 
      phoneNumber: true, 
      email: true, 
      image: true, 
      banner: true,
      createdAt: true,
      _count: {
        select: {
          thoughts: true,
          followers: true,
          following: true
        }
      }
    },
  })

  // Get thoughts for the tabs
  const thoughts = await prisma.thought.findMany({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, image: true, id: true } },
      likes: { where: { userId: session.user.id } },
      republishes: { where: { userId: session.user.id } },
      savedBy: { where: { userId: session.user.id } },
      _count: { select: { likes: true, comments: true, republishes: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  const republishes = await prisma.republish.findMany({
    where: { userId: session.user.id },
    include: {
      thought: {
        include: {
          user: { select: { name: true, image: true, id: true } },
          likes: { where: { userId: session.user.id } },
          republishes: { where: { userId: session.user.id } },
          savedBy: { where: { userId: session.user.id } },
          _count: { select: { likes: true, comments: true, republishes: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const savedPosts = await prisma.save.findMany({
    where: { userId: session.user.id },
    include: {
      thought: {
        include: {
          user: { select: { name: true, image: true, id: true } },
          likes: { where: { userId: session.user.id } },
          republishes: { where: { userId: session.user.id } },
          savedBy: { where: { userId: session.user.id } },
          _count: { select: { likes: true, comments: true, republishes: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ 
    user, 
    thoughts, 
    republishes: republishes.map(r => r.thought),
    savedPosts: savedPosts.map(s => s.thought)
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, bio, phoneNumber, image, banner } = await req.json()

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio, phoneNumber, image, banner },
  })

  return NextResponse.json({ user })
}
