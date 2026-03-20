// app/api/tags/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ tags })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, color } = await req.json()
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })

  const tag = await prisma.tag.upsert({
    where: { name_userId: { name, userId: session.user.id } },
    update: { color: color || "#6366f1" },
    create: { name, color: color || "#6366f1", userId: session.user.id },
  })

  return NextResponse.json({ tag }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

  await prisma.tag.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ success: true })
}
