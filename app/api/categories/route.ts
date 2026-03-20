// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { prompts: true } } },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, color, icon } = await req.json()
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })

  const existing = await prisma.category.findFirst({
    where: { name, userId: session.user.id },
  })
  if (existing) return NextResponse.json({ error: "Categoria já existe" }, { status: 400 })

  const category = await prisma.category.create({
    data: { name, description, color: color || "#8b5cf6", icon, userId: session.user.id },
    include: { _count: { select: { prompts: true } } },
  })

  return NextResponse.json({ category }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, name, description, color, icon } = await req.json()
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

  const category = await prisma.category.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(icon !== undefined && { icon }),
    },
  })

  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

  await prisma.category.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ success: true })
}
