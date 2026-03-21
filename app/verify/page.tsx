"use client"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react"

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const type = searchParams.get("type") || "email-verification"
  
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, type }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao verificar")

      router.push("/login?verified=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao reenviar")
      
      alert("Código enviado para " + email)
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
          <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-brand" size={24} />
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">
            Verificação de Segurança
          </h1>
          <p className="text-text-muted text-sm px-4">
            Insira o código enviado para <span className="text-text-secondary font-medium">{email}</span>
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm italic">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="label">Código de 6 dígitos</label>
              <input
                type="text"
                className="input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            {type === "password-reset" && (
              <div className="space-y-1.5">
                <label className="label">Nova Senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Verificar e Prosseguir <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Não recebeu o código?{" "}
          <button 
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-brand hover:underline disabled:opacity-50"
          >
            Reenviar
          </button>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  )
}
