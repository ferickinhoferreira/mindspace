// app/api/auth/resend/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Generate new 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete old tokens for this email to avoid duplicates
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires: new Date(Date.now() + 3600000), // 1 hour
      },
    })

    // Send the email
    await sendVerificationEmail(email, code)

    console.log(`[AUTH] Resent verification email to ${email}: ${code}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json({ error: "Erro ao reenviar código" }, { status: 500 })
  }
}
