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
} from "lucide-react"
import { PostModal } from "./post-modal"

const actions = [
  { id: "STORY",       icon: Zap,        label: "Story",        gradient: "from-yellow-400 to-orange-500" },
  { id: "PHOTO",       icon: ImageIcon,  label: "Foto",         gradient: "from-blue-400 to-cyan-500" },
  { id: "VIDEO",       icon: Video,      label: "Vídeo",        gradient: "from-red-500 to-rose-600" },
  { id: "SHORT_VIDEO", icon: Play,       label: "Short",        gradient: "from-pink-500 to-fuchsia-600" },
  { id: "POST",        icon: FileText,   label: "Texto",        gradient: "from-green-400 to-emerald-600" },
  { id: "THOUGHT",     icon: Lightbulb,  label: "Pensamento",   gradient: "from-amber-400 to-yellow-500" },
  { id: "PROMPT",      icon: Sparkles,   label: "Prompt IA",    gradient: "from-violet-500 to-purple-600" },
]

export function FABCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-24 lg:bottom-8 right-5 lg:right-8 z-50 flex flex-col items-end gap-3">
        {/* Speed Dial */}
        <div
          className={`flex flex-col items-end gap-2.5 transition-all duration-300 origin-bottom ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {actions.map((action, i) => (
            <div
              key={action.id}
              className="flex items-center gap-3 group"
              style={{
                transitionDelay: isOpen ? `${i * 40}ms` : "0ms",
                transform: isOpen ? "translateX(0)" : "translateX(20px)",
                opacity: isOpen ? 1 : 0,
                transition: "all 0.25s ease",
              }}
            >
              {/* Label */}
              <div className="bg-bg-surface border border-bg-border px-3 py-1.5 rounded-full text-xs font-semibold text-text-primary shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {action.label}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setModalType(action.id)
                  setIsOpen(false)
                }}
                className={`w-11 h-11 bg-gradient-to-br ${action.gradient} text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:scale-110`}
              >
                <action.icon size={18} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? "bg-red-500 rotate-45 shadow-red-500/30"
              : "shadow-brand/30 hover:scale-110"
          }`}
          style={
            isOpen
              ? {}
              : { background: "linear-gradient(135deg, #7c6af7, #e040fb)" }
          }
        >
          {isOpen ? <X size={26} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={2.5} />}
        </button>
      </div>

      {modalType && (
        <PostModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </>
  )
}
