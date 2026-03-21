"use client"
// app/onboarding/page.tsx
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Camera, Check, User, Sparkles } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: "",
    bio: "",
    image: ""
  })

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        bio: "",
        image: session.user.image || ""
      })
    }
  }, [session])

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        await update() // Refresh session
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glow-dot opacity-20" style={{ top: '20%', left: '20%' }} />
      <div className="glow-dot-secondary opacity-20" style={{ bottom: '20%', right: '20%' }} />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
              <Sparkles className="text-brand" size={20} />
            </div>
            <span className="font-display text-2xl text-text-primary">Bem-vindo ao MindSpace</span>
          </div>
          <p className="text-text-muted">Vamos deixar o seu perfil com a sua cara antes de começar.</p>
        </div>

        <div className="card p-8 space-y-8 backdrop-blur-xl border-brand/10">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-brand' : 'w-4 bg-bg-border'}`} 
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand/30 bg-bg-secondary flex items-center justify-center">
                    {form.image ? (
                      <img src={form.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-text-muted" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-brand rounded-full text-white border-2 border-bg-base hover:scale-110 transition-transform">
                    <Camera size={16} />
                  </button>
                </div>
                <p className="text-xs text-text-muted italic">Sua foto atual do Google/GitHub</p>
              </div>

              <div className="space-y-1.5">
                <label className="label">Como devemos te chamar?</label>
                <input 
                  type="text" 
                  className="input" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Seu nome"
                />
              </div>

              <button 
                onClick={() => setStep(2)}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                Próximo passo
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="label">Fale um pouco sobre você (Bio)</label>
                <textarea 
                  className="input min-h-[120px] resize-none py-3" 
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  placeholder="Ex: Explorador de ideias, amante de café e tecnologia..."
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-3"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-[2] flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Começar agora!
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-text-muted text-xs mt-6 hover:text-brand transition-colors"
        >
          Pular por enquanto e ir ao Dashboard
        </button>
      </div>
    </div>
  )
}
