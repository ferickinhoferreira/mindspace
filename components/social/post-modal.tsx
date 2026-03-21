"use client"
// components/social/post-modal.tsx
import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { 
  X, 
  Image as ImageIcon, 
  Video, 
  Play, 
  Globe, 
  Lock, 
  Loader2,
  Sparkles,
  Lightbulb
} from "lucide-react"

interface PostModalProps {
  type: string
  onClose: () => void
}

export function PostModal({ type, onClose }: PostModalProps) {
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  const getTitle = () => {
    switch (type) {
      case "PHOTO": return "Publicar Foto"
      case "VIDEO": return "Publicar Vídeo"
      case "SHORT_VIDEO": return "Vídeo Curto"
      case "PROMPT": return "Criar Prompt IA"
      case "THOUGHT": return "Novo Pensamento"
      case "STORY": return "Novo Story"
      default: return "Criar Publicação"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "PHOTO": return <ImageIcon className="text-blue-500" />
      case "VIDEO": return <Video className="text-red-500" />
      case "SHORT_VIDEO": return <Play className="text-pink-500" />
      case "PROMPT": return <Sparkles className="text-purple-500" />
      case "THOUGHT": return <Lightbulb className="text-yellow-500" />
      case "STORY": return <Sparkles className="text-brand" />
      default: return <Globe className="text-brand" />
    }
  }

  async function handleSubmit() {
    if ((type === "PHOTO" || type === "VIDEO" || type === "SHORT_VIDEO" || type === "STORY") && !mediaUrl) {
      alert("Por favor, adicione um link de mídia.")
      return
    }

    setLoading(true)
    try {
      let endpoint = "/api/thoughts"
      let body: any = { content, type, mediaUrl, mediaType: type.toLowerCase(), isPublic }

      if (type === "PROMPT") {
        endpoint = "/api/prompts"
        body = { title: "Novo Prompt", content, isPublic }
      } else if (type === "STORY") {
        endpoint = "/api/stories"
        body = { mediaUrl, mediaType: "image" } // Default to image for now
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        onClose()
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-secondary border border-bg-border rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
          
          <div className="flex items-center justify-between p-4 border-b border-bg-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center border border-bg-border">
                {getIcon()}
              </div>
              <div>
                <Dialog.Title className="text-text-primary font-semibold">
                  {getTitle()}
                </Dialog.Title>
                <p className="text-text-muted text-xs">Compartilhe com sua rede</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-bg-base rounded-full transition-colors">
              <X size={20} className="text-text-muted" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            <textarea
              autoFocus
              className="w-full bg-transparent border-none focus:ring-0 text-text-primary placeholder:text-text-muted text-lg resize-none min-h-[150px]"
              placeholder={type === "POST" ? "O que você está pensando?" : "Adicione uma legenda..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {(type === "PHOTO" || type === "VIDEO" || type === "SHORT_VIDEO") && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Link da Mídia (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <button className="btn-secondary px-3">
                    <ImageIcon size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-bg-border">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isPublic 
                      ? "bg-brand/10 border-brand/30 text-brand" 
                      : "bg-bg-base border-bg-border text-text-muted"
                  }`}
                >
                  {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                  <span className="text-xs font-medium">{isPublic ? "Público" : "Privado"}</span>
                </button>
              </div>

              <button
                disabled={loading || !content}
                onClick={handleSubmit}
                className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Publicar
              </button>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
