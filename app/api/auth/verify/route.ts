import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, code, password, type } = await req.json()

    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }

    if (type === "email-verification") {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      })
    } else if (type === "password-reset" && password) {
      const hashed = await hash(password, 12)
      await prisma.user.update({
        where: { email },
        data: { password: hashed },
      })
    }

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 })
  }
}
