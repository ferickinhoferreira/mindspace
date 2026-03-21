"use client"
// components/social/post-modal.tsx
import { useState, useRef } from "react"
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
  Lightbulb,
  FileText,
  Zap,
  Smile,
  MapPin,
  BarChart2,
} from "lucide-react"

interface PostModalProps {
  type: string
  onClose: () => void
}

const TYPE_CONFIG: Record<string, { title: string; placeholder: string; color: string }> = {
  STORY:       { title: "Novo Story",          placeholder: "Adicione um link de mídia para o story...",  color: "from-brand to-yellow-400" },
  PHOTO:       { title: "Nova Foto",           placeholder: "Escreva uma legenda...",                     color: "from-blue-400 to-cyan-500" },
  VIDEO:       { title: "Novo Vídeo",          placeholder: "Escreva uma descrição...",                   color: "from-red-500 to-rose-600" },
  SHORT_VIDEO: { title: "Vídeo Curto",         placeholder: "Escreva algo sobre o vídeo...",              color: "from-pink-500 to-fuchsia-600" },
  POST:        { title: "Nova Publicação",     placeholder: "O que está acontecendo?",                    color: "from-emerald-400 to-green-600" },
  THOUGHT:     { title: "Novo Pensamento",     placeholder: "Qual é o seu pensamento?",                   color: "from-amber-400 to-yellow-500" },
  PROMPT:      { title: "Prompt de IA",        placeholder: "Descreva seu prompt para IA...",             color: "from-violet-500 to-purple-600" },
}

const MEDIA_TYPES = ["STORY", "PHOTO", "VIDEO", "SHORT_VIDEO"]

export function PostModal({ type, onClose }: PostModalProps) {
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 280
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.POST

  function handleTextChange(val: string) {
    if (val.length <= MAX_CHARS) {
      setContent(val)
      setCharCount(val.length)
    }
  }

  async function handleSubmit() {
    if (MEDIA_TYPES.includes(type) && !mediaUrl) return

    setLoading(true)
    try {
      let endpoint = "/api/thoughts"
      let body: any = {
        content,
        type,
        mediaUrl: mediaUrl || undefined,
        mediaType: type.toLowerCase(),
        isPublic,
      }

      if (type === "PROMPT") {
        endpoint = "/api/prompts"
        body = { title: "Novo Prompt", content, isPublic }
      } else if (type === "STORY") {
        endpoint = "/api/stories"
        body = { mediaUrl, mediaType: "image", content }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onClose()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const charPercent = (charCount / MAX_CHARS) * 100
  const strokeColor = charPercent > 90 ? "#f43f5e" : charPercent > 70 ? "#f59e0b" : "#7c6af7"

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]" />

        {/* Modal */}
        <Dialog.Content className="fixed bottom-0 sm:top-1/2 sm:bottom-auto left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-[560px] bg-bg-surface border border-bg-border sm:rounded-2xl shadow-2xl z-[101] overflow-hidden rounded-t-3xl animate-slide-up sm:animate-scale-in">
          
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-bg-border rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
            <Dialog.Close
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-overlay transition-colors text-text-muted hover:text-text-primary"
            >
              <X size={20} strokeWidth={2.5} />
            </Dialog.Close>

            <Dialog.Title className="text-[15px] font-bold text-text-primary">
              {cfg.title}
            </Dialog.Title>

            <button
              disabled={loading || (!content && !MEDIA_TYPES.includes(type))}
              onClick={handleSubmit}
              className="bg-brand hover:bg-brand-dim disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Publicar
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex gap-3">
            {/* Fake avatar */}
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-alt" />

            <div className="flex-1 min-w-0">
              {/* Privacy pill */}
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isPublic
                    ? "border-brand/40 text-brand bg-brand/10"
                    : "border-bg-border text-text-muted"
                }`}
              >
                {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                {isPublic ? "Todos podem ver" : "Somente eu"}
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                autoFocus
                className="w-full bg-transparent text-[17px] text-text-primary placeholder:text-text-muted leading-relaxed resize-none outline-none min-h-[120px]"
                placeholder={cfg.placeholder}
                value={content}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={5}
              />

              {/* Media URL input */}
              {MEDIA_TYPES.includes(type) && (
                <div className="mt-3 flex items-center gap-2 bg-bg-overlay rounded-xl px-3 py-2.5 border border-bg-border">
                  <ImageIcon size={16} className="text-text-muted flex-shrink-0" />
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Cole o link da mídia aqui (URL)..."
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
            {/* Toolbar icons */}
            <div className="flex items-center gap-3 text-brand">
              <button className="hover:bg-brand/10 rounded-full p-1.5 transition-colors">
                <ImageIcon size={20} />
              </button>
              <button className="hover:bg-brand/10 rounded-full p-1.5 transition-colors">
                <BarChart2 size={20} />
              </button>
              <button className="hover:bg-brand/10 rounded-full p-1.5 transition-colors">
                <Smile size={20} />
              </button>
              <button className="hover:bg-brand/10 rounded-full p-1.5 transition-colors">
                <MapPin size={20} />
              </button>
            </div>

            {/* Char counter */}
            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#2f2f2f" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="3"
                      strokeDasharray={`${charPercent * 0.942} 94.2`}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                    />
                  </svg>
                  {charCount > MAX_CHARS * 0.9 && (
                    <span className="absolute text-[10px] font-bold" style={{ color: strokeColor }}>
                      {MAX_CHARS - charCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
