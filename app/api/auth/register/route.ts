// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashed = await hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true },
    })

    // Create default categories for the new user
    await prisma.category.createMany({
      data: [
        { name: "Escrita Criativa", color: "#ec4899", icon: "✍️", userId: user.id },
        { name: "Produtividade", color: "#3b82f6", icon: "⚡", userId: user.id },
        { name: "Análise", color: "#10b981", icon: "🔍", userId: user.id },
        { name: "Imagem & Arte", color: "#f59e0b", icon: "🎨", userId: user.id },
        { name: "Código", color: "#8b5cf6", icon: "💻", userId: user.id },
      ],
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
