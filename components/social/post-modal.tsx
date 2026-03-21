"use client"
// components/social/post-modal.tsx
import { useState, useRef, useEffect } from "react"
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
  CheckCircle2,
  AlertCircle,
  FileUp,
  Clock,
  Mic,
} from "lucide-react"
import { AudioRecorder } from "./audio-recorder"
import { AudioPlayer } from "./audio-player"

interface PostModalProps {
  type: string
  onClose: () => void
  editData?: any // To support editing existing posts
}

const TYPE_CONFIG: Record<string, { title: string; placeholder: string; color: string; icon: any }> = {
  STORY:       { title: "Novo Story",          placeholder: "Adicione uma mídia para o seu story...",  color: "brand", icon: Zap },
  PHOTO:       { title: "Nova Foto",           placeholder: "Escreva uma legenda...",                     color: "blue-400", icon: ImageIcon },
  VIDEO:       { title: "Novo Vídeo",          placeholder: "Escreva uma descrição...",                   color: "red-500", icon: Video },
  SHORT_VIDEO: { title: "Vídeo Curto",         placeholder: "Escreva algo sobre o vídeo...",              color: "pink-500", icon: Play },
  POST:        { title: "Nova Publicação",     placeholder: "O que está acontecendo?",                    color: "emerald-400", icon: Sparkles },
  THOUGHT:     { title: "Novo Pensamento",     placeholder: "Qual é o seu pensamento?",                   color: "amber-400", icon: Lightbulb },
  PROMPT:      { title: "Prompt de IA",        placeholder: "Descreva seu prompt para IA...",             color: "violet-500", icon: FileText },
}

const MEDIA_TYPES = ["STORY", "PHOTO", "VIDEO", "SHORT_VIDEO"]

export function PostModal({ type, onClose, editData }: PostModalProps) {
  const [content, setContent] = useState(editData?.content || "")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(editData?.mediaUrl || null)
  const [isPublic, setIsPublic] = useState(editData?.isPublic ?? true)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0) // bytes per ms
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)
  const [mediaType, setMediaType] = useState<string>("image")
  
  const [charCount, setCharCount] = useState(content.length)
  const MAX_CHARS = 280
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.POST

  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile)
      setMediaPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [mediaFile])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const isVideo = file.type.startsWith("video/")
    const limit = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB vs 10MB
    if (file.size > limit) {
      setError(`O arquivo é muito grande. Limite: ${isVideo ? "100MB" : "10MB"}`)
      return
    }

    setError(null)
    setMediaFile(file)
    setMediaType(file.type.startsWith("video/") ? "video" : "image")
  }

  async function handleAudioComplete(blob: Blob, duration: number) {
    setShowRecorder(false)
    setLoading(true)
    try {
      const audioFile = new File([blob], "voice-message.webm", { type: "audio/webm" })
      const url = await uploadFile(audioFile)
      setMediaPreview(url)
      setMediaType("audio")
    } catch (err) {
      setError("Erro ao processar áudio.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (MEDIA_TYPES.includes(type) && !mediaFile && !editData?.mediaUrl) {
      setError("Por favor, selecione um arquivo de mídia.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let finalMediaUrl = editData?.mediaUrl || ""

      // 1. Upload file if exists
      if (mediaFile) {
        finalMediaUrl = await uploadFile(mediaFile)
      }

      // 2. Save/Update post
      const endpoint = editData ? `/api/thoughts/${editData.id}` : "/api/thoughts"
      const method = editData ? "PATCH" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          type,
          mediaUrl: finalMediaUrl || undefined,
          mediaType: mediaType,
          isPublic,
        }),
      })

      if (res.ok) {
        onClose()
        window.location.reload()
      } else {
        setError("Erro ao salvar publicação. Tente novamente.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Falha na conexão. Verifique sua rede.")
    } finally {
      setLoading(false)
    }
  }

  function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append("file", file)

      const startTime = Date.now()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
          
          const elapsed = Date.now() - startTime
          const speed = e.loaded / elapsed // bytes per ms
          const remaining = (e.total - e.loaded) / speed // ms
          setTimeLeft(remaining / 1000)
        }
      })

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText)
            resolve(res.url)
          } else {
            try {
              const res = JSON.parse(xhr.responseText)
              reject(new Error(res.tip || res.error || "Upload failed"))
            } catch {
              reject(new Error("Upload failed"))
            }
          }
        }
      }

      xhr.open("POST", "/api/upload", true)
      xhr.send(formData)
    })
  }

  const charPercent = (charCount / MAX_CHARS) * 100
  const strokeColor = charPercent > 90 ? "#f43f5e" : charPercent > 70 ? "#f59e0b" : "#7c6af7"

  return (
    <Dialog.Root open onOpenChange={(o) => !o && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:max-w-[560px] bg-bg-surface border border-bg-border rounded-2xl shadow-2xl z-[101] overflow-hidden animate-scale-in">
          
          <Dialog.Title className="sr-only">
            {editData ? "Editar Publicação" : cfg.title}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Crie ou edite sua publicação no MindSpace.
          </Dialog.Description>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border/50 bg-bg-surface/80 backdrop-blur-md">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-overlay transition-colors text-text-muted hover:text-text-primary disabled:opacity-30"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <span className="text-[15px] font-bold text-text-primary flex items-center gap-2">
              <cfg.icon size={16} className={`text-${cfg.color}`} />
              {editData ? "Editar Publicação" : cfg.title}
            </span>

            <button
              disabled={loading || (!content && !mediaFile && !editData?.mediaUrl)}
              onClick={handleSubmit}
              className="bg-brand hover:bg-brand-dim disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : editData ? "Salvar" : "Publicar"}
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex gap-3 overflow-y-auto max-h-[70vh] no-scrollbar">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-alt" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    isPublic ? "border-brand/40 text-brand bg-brand/10" : "border-bg-border text-text-muted"
                  }`}
                >
                  {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                  {isPublic ? "Todos podem ver" : "Somente eu"}
                </button>
              </div>

              <textarea
                autoFocus
                className="w-full bg-transparent text-[17px] text-text-primary placeholder:text-text-muted leading-relaxed resize-none outline-none min-h-[100px]"
                placeholder={cfg.placeholder}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setContent(e.target.value)
                    setCharCount(e.target.value.length)
                  }
                }}
                rows={4}
              />

              {/* Media Preview / Selection */}
              {MEDIA_TYPES.includes(type) && (
                <div className="mt-3">
                  {mediaPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-bg-border group">
                      {mediaType === "video" ? (
                        <video src={mediaPreview} className="w-full aspect-video object-cover" />
                      ) : mediaType === "audio" ? (
                        <AudioPlayer src={mediaPreview} className="bg-bg-overlay/50 border-none" />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                      )}
                      {!loading && (
                        <button
                          onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-bg-border flex flex-col items-center justify-center gap-3 text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-bg-overlay flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileUp size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">Clique para selecionar</p>
                        <p className="text-xs opacity-60 mt-1">Fotos até 10MB, Vídeos até 100MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={type === "PHOTO" ? "image/*" : type.includes("VIDEO") ? "video/*" : "image/*,video/*"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {showRecorder && (
                <div className="mt-4">
                  <AudioRecorder 
                    onRecordingComplete={handleAudioComplete}
                    onCancel={() => setShowRecorder(false)}
                  />
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-2 rounded-xl text-[13px] animate-shake">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Overlay */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="px-4 py-3 bg-bg-overlay border-t border-bg-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  Enviando arquivo...
                </span>
                <span className="text-xs text-text-muted tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted">
                <Clock size={10} />
                <span>Tempo restante estimado: {timeLeft !== null ? `${Math.ceil(timeLeft)}s` : "calculando..."}</span>
              </div>
            </div>
          )}

          {/* Footer toolbar */}
          {!loading && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border/50">
              <div className="flex items-center gap-1 text-brand">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:bg-brand/10 rounded-full p-2 transition-colors tooltip"
                >
                  <ImageIcon size={20} />
                </button>
                <button className="hover:bg-brand/10 rounded-full p-2 transition-colors">
                  <BarChart2 size={20} />
                </button>
                <button className="hover:bg-brand/10 rounded-full p-2 transition-colors">
                  <Smile size={20} />
                </button>
                <button className="hover:bg-brand/10 rounded-full p-2 transition-colors">
                  <MapPin size={20} />
                </button>
                <button 
                  onClick={() => setShowRecorder(!showRecorder)}
                  className={`hover:bg-brand/10 rounded-full p-2 transition-colors ${showRecorder ? "text-brand bg-brand/10" : ""}`}
                >
                  <Mic size={20} />
                </button>
              </div>

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
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
