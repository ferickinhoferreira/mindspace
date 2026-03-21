"use client"
// components/social/fab-create.tsx
import { useState, useEffect } from "react"
import {
  Plus,
  Image as ImageIcon,
  Video,
  Play,
  FileText,
  Lightbulb,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import { PostModal } from "./post-modal"

const ACTIONS = [
  { id: "POST", icon: FileText, label: "Publicação", sub: "Texto, link ou citação", from: "#7c6af7", to: "#5b52d6" },
  { id: "STORY", icon: Zap, label: "Story", sub: "Desaparece em 24h", from: "#f09433", to: "#bc1888" },
  { id: "PHOTO", icon: ImageIcon, label: "Foto", sub: "Imagem do feed", from: "#2196f3", to: "#00bcd4" },
  { id: "VIDEO", icon: Video, label: "Vídeo", sub: "Vídeo completo", from: "#e53935", to: "#e91e63" },
  { id: "SHORT_VIDEO", icon: Play, label: "Reels / Short", sub: "Vídeo curto vertical", from: "#e040fb", to: "#7c6af7" },
  { id: "THOUGHT", icon: Lightbulb, label: "Pensamento", sub: "Ideia ou reflexão", from: "#ff8f00", to: "#f57c00" },
  { id: "PROMPT", icon: Sparkles, label: "Prompt IA", sub: "Para assistentes de IA", from: "#8e24aa", to: "#5e35b1" },
]

export function FABCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)

  // Listen for custom event from MobileNav
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-create-sheet", handleOpen)
    return () => window.removeEventListener("open-create-sheet", handleOpen)
  }, [])

  function open(id: string) {
    setModalType(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* FAB TRIGGER REMOVED TO UNIFY INTERFACE - ACCESSIBLE VIA SIDEBAR EVENT */}

      {/* ── Bottom-sheet overlay ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-t-[40px] border-t border-white/10 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-4 pb-2"><div className="w-12 h-1.5 bg-white/10 rounded-full" /></div>
            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <h2 className="text-xl font-black text-white tracking-tight">O que vamos criar?</h2>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 px-6 pb-12 overflow-y-auto max-h-[60vh] no-scrollbar">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => open(action.id)}
                  className="relative flex flex-col items-center gap-4 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 active:scale-95 transition-all text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${action.from}, ${action.to})` }}>
                    <action.icon size={24} strokeWidth={2.5} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-white leading-tight">{action.label}</p>
                    <p className="text-[11px] text-white/40 mt-1">{action.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalType && <PostModal type={modalType} onClose={() => setModalType(null)} />}
    </>
  )
}
