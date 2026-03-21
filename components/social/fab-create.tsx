"use client"
// components/social/fab-create.tsx
import { useState } from "react"
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
  BookOpen,
} from "lucide-react"
import { PostModal } from "./post-modal"

const ACTIONS = [
  {
    id: "POST",
    icon: FileText,
    label: "Publicação",
    sub: "Texto, link ou citação",
    from: "#7c6af7",
    to: "#5b52d6",
  },
  {
    id: "STORY",
    icon: Zap,
    label: "Story",
    sub: "Desaparece em 24h",
    from: "#f09433",
    to: "#bc1888",
  },
  {
    id: "PHOTO",
    icon: ImageIcon,
    label: "Foto",
    sub: "Imagem do feed",
    from: "#2196f3",
    to: "#00bcd4",
  },
  {
    id: "VIDEO",
    icon: Video,
    label: "Vídeo",
    sub: "Vídeo completo",
    from: "#e53935",
    to: "#e91e63",
  },
  {
    id: "SHORT_VIDEO",
    icon: Play,
    label: "Reels / Short",
    sub: "Vídeo curto vertical",
    from: "#e040fb",
    to: "#7c6af7",
  },
  {
    id: "THOUGHT",
    icon: Lightbulb,
    label: "Pensamento",
    sub: "Ideia ou reflexão",
    from: "#ff8f00",
    to: "#f57c00",
  },
  {
    id: "PROMPT",
    icon: Sparkles,
    label: "Prompt IA",
    sub: "Para assistentes de IA",
    from: "#8e24aa",
    to: "#5e35b1",
  },
]

export function FABCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)

  function open(id: string) {
    setModalType(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* ── Only show FAB on desktop (mobile uses bottom nav + button) ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 hidden lg:flex w-14 h-14 rounded-full items-center justify-center text-white shadow-2xl shadow-brand/30 hover:scale-110 active:scale-95 transition-all duration-300"
        style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)" }}
        aria-label="Criar publicação"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* ── Bottom-sheet overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Sheet */}
          <div
            className="relative w-full max-w-lg bg-[#111111] rounded-t-3xl pb-safe shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-[#333] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-1 border-b border-[#222]">
              <h2 className="text-[17px] font-bold text-white">Criar novo</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#222] hover:bg-[#2a2a2a] transition-colors text-[#aaa] hover:text-white active:scale-95"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Actions grid */}
            <div className="grid grid-cols-2 gap-3 p-4">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => open(action.id)}
                  className="relative flex items-center gap-3.5 p-4 rounded-2xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#3a3a3a] active:scale-[0.97] transition-all duration-200 text-left group overflow-hidden"
                >
                  {/* Subtle gradient accent */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${action.from}12, ${action.to}08)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${action.from}, ${action.to})`,
                    }}
                  >
                    <action.icon size={20} strokeWidth={2} className="text-white" />
                  </div>

                  {/* Label */}
                  <div className="min-w-0 relative z-10">
                    <p className="text-[14px] font-bold text-white leading-tight truncate">{action.label}</p>
                    <p className="text-[11px] text-[#666] mt-0.5 leading-tight truncate">{action.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Cancel */}
            <div className="px-4 pb-6 pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#aaa] text-[15px] font-semibold transition-colors active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {modalType && (
        <PostModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </>
  )
}
