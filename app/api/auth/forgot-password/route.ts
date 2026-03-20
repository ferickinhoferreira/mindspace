import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    
    // Safety: we return OK even if user doesn't exist to prevent email enumeration
    if (!user) return NextResponse.json({ success: true })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    })

    // Here you would send the email with the reset code
    console.log(`[AUTH] Reset code for ${email}: ${code}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
