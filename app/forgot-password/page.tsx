"use client"
import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Erro ao enviar email de recuperação")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="glow-dot" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
           <Link href="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors font-medium group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar para o login
          </Link>
          <h1 className="font-display text-2xl text-text-primary mb-2">Recuperar Senha</h1>
          <p className="text-text-muted text-sm px-4">Enviaremos um link de recuperação para o seu email</p>
        </div>

        <div className="card p-6">
          {success ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
              <h3 className="text-text-primary font-medium mb-2">Verifique seu email</h3>
              <p className="text-text-muted text-xs leading-relaxed">
                Se existir uma conta com esse endereço, enviaremos as instruções de recuperação em instantes.
              </p>
              <button onClick={() => setSuccess(false)} className="text-brand hover:text-brand-dim text-xs mt-6 font-medium">
                Tentar outro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="label">Endereço de Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="você@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Enviar Instruções"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
