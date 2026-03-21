import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, username, bio, image, banner } = await req.json()

  try {
    // Check if username is already taken by someone else
    if (username) {
      const existing = await prisma.user.findUnique({
        where: { username } as any
      })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Username já em uso" }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        bio,
        image,
        banner
      } as any
    })

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
