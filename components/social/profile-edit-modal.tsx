"use client"
import { useState, useRef } from "react"
import { X, Camera, Loader2, Check } from "lucide-react"
import { upload } from "@vercel/blob/client"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ProfileEditModalProps {
  user: any
  onClose: () => void
  onUpdate: () => void
}

export function ProfileEditModal({ user, onClose, onUpdate }: ProfileEditModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    image: user.image || "",
    banner: user.banner || "",
  })

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: "image" | "banner") {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    try {
      // @ts-ignore
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/blob",
      })

      setFormData((prev) => ({ ...prev, [field]: newBlob.url }))
      toast({ title: `${field === "image" ? "Foto" : "Capa"} carregada com sucesso!` })
    } catch (error: any) {
      console.error("Profile upload error:", error)
      toast({ 
        title: "Erro ao subir arquivo", 
        description: error.message || "Verifique sua conexão.",
        variant: "destructive" 
      })
    } finally {
      setUploading(null)
    }
  }

  async function handleSubmit() {
    if (!formData.name.trim()) return toast({ title: "Nome é obrigatório", variant: "destructive" })
    
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({ title: "Perfil atualizado!" })
        onUpdate()
        onClose()
      } else {
        const data = await res.json()
        toast({ title: data.error || "Erro ao atualizar", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erro na conexão", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-base border border-bg-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-bg-border rounded-full transition-colors">
               <X size={20} className="text-text-muted" />
             </button>
             <h2 className="text-lg font-bold text-text-primary italic">Editar Perfil</h2>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || !!uploading}
            className="bg-brand hover:bg-brand-dim text-white font-bold px-6 py-2 rounded-full transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Salvar</>}
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto no-scrollbar pb-8">
          {/* Banner Edit */}
          <div className="relative h-32 sm:h-40 bg-bg-surface group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
            {formData.banner ? (
              <Image src={formData.banner} alt="Banner" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand-alt/20" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
                {uploading === "banner" ? <Loader2 size={24} className="animate-spin text-white" /> : <Camera size={24} className="text-white" />}
              </div>
            </div>
            <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, "banner")} />
          </div>

          {/* Avatar Edit */}
          <div className="px-6 -mt-12 relative z-10 flex">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-bg-base bg-bg-surface group cursor-pointer shadow-xl"
              onClick={() => avatarInputRef.current?.click()}
            >
              {formData.image ? (
                <Image src={formData.image} alt="Avatar" fill className="object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
              ) : (
                <div className="w-full h-full bg-brand flex items-center justify-center text-white text-3xl font-black">
                  {formData.name?.[0].toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                  {uploading === "image" ? <Loader2 size={16} className="animate-spin text-white" /> : <Camera size={16} className="text-white" />}
                </div>
              </div>
              <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, "image")} />
            </div>
          </div>

          <div className="px-6 mt-6 space-y-5">
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Nome de Exibição</label>
               <input 
                 type="text"
                 value={formData.name}
                 onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                 className="w-full bg-bg-surface border border-bg-border rounded-2xl px-4 py-3 text-text-primary outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all"
                 placeholder="Seu nome real ou apelido"
               />
             </div>

             <div className="space-y-1.5">
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Username (@)</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">@</span>
                 <input 
                   type="text"
                   value={formData.username}
                   onChange={e => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                   className="w-full bg-bg-surface border border-bg-border rounded-2xl pl-8 pr-4 py-3 text-text-primary outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all"
                   placeholder="usernickname"
                 />
               </div>
               <p className="text-[10px] text-text-muted ml-1 italic">* Identificador único na plataforma</p>
             </div>

             <div className="space-y-1.5">
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Biografia</label>
               <textarea 
                 value={formData.bio}
                 onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                 rows={3}
                 className="w-full bg-bg-surface border border-bg-border rounded-2xl px-4 py-3 text-text-primary outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all resize-none"
                 placeholder="Conte um pouco sobre você..."
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
