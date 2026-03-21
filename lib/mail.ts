// lib/mail.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "MindSpace <onboarding@resend.dev>", // Replace with your domain when ready
      to: email,
      subject: "Seu código de verificação MindSpace: " + code,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifique seu email no MindSpace</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #09090b; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 40px; text-align: center; }
            .logo { width: 40px; height: 40px; background-color: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; color: #8b5cf6; font-size: 20px; }
            h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
            p { font-size: 16px; color: #a1a1aa; line-height: 1.5; margin-bottom: 32px; }
            .code-container { background-color: rgba(139, 92, 246, 0.05); border: 1px dashed rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 32px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #8b5cf6; font-family: monospace; }
            .footer { margin-top: 32px; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; padding-top: 24px; }
            .brand { color: #8b5cf6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">✦</div>
              <h1>Verifique seu email</h1>
              <p>Olá! Use o código abaixo para confirmar seu acesso ao <span class="brand">MindSpace</span>. Ele expira em 1 hora.</p>
              
              <div class="code-container">
                ${code}
              </div>
              
              <p style="font-size: 14px;">Se você não solicitou este código, por favor ignore este email.</p>
              
              <div class="footer">
                <p>&copy; 2026 MindSpace. Todos os direitos reservados.</p>
                <p>Onde seus pensamentos ganham ordem e propósito.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Internal mail error:", error)
    return { success: false, error }
  }
}
