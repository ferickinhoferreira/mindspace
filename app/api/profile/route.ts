import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, phoneNumber: true, email: true, image: true, banner: true },
  })

  return NextResponse.json({ user })
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
