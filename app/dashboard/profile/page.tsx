"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Save, User as UserIcon, Phone, FileText } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ name: "", bio: "", phoneNumber: "" })
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setForm({
            name: data.user.name || "",
            bio: data.user.bio || "",
            phoneNumber: data.user.phoneNumber || "",
          })
          setFetching(false)
        })
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Erro ao atualizar perfil")

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
      await update({ name: form.name })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-brand" />
    </div>
  )

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-text-primary mb-1">Configurações de Perfil</h1>
        <p className="text-text-muted text-sm">Gerencie suas informações pessoais e como elas aparecem</p>
      </div>

      <div className="card p-6">
        {message.text && (
          <div className={message.type === "success" ? "bg-green-500/10 text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/20" : "bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20"}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <UserIcon size={14} className="text-text-muted" />
              Nome Público
            </label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <Phone size={14} className="text-text-muted" />
              Número de Celular
            </label>
            <input
              type="tel"
              className="input"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+55 (11) 99999-9999"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label flex items-center gap-2">
              <FileText size={14} className="text-text-muted" />
              Bio / Sobre você
            </label>
            <textarea
              className="input min-h-[100px] py-3 resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  )
}
