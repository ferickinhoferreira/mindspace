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
  PlusCircle
} from "lucide-react"
import { PostModal } from "./post-modal"

export function FABCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)

  const actions = [
    { id: "STORY", icon: <PlusCircle size={20} />, label: "Story", color: "bg-brand" },
    { id: "PHOTO", icon: <ImageIcon size={20} />, label: "Foto", color: "bg-blue-500" },
    { id: "VIDEO", icon: <Video size={20} />, label: "Vídeo", color: "bg-red-500" },
    { id: "SHORT_VIDEO", icon: <Play size={20} />, label: "Vídeo Curto", color: "bg-pink-500" },
    { id: "POST", icon: <FileText size={20} />, label: "Texto", color: "bg-green-500" },
    { id: "THOUGHT", icon: <Lightbulb size={20} />, label: "Pensamento", color: "bg-yellow-500" },
    { id: "PROMPT", icon: <Sparkles size={20} />, label: "Prompt IA", color: "bg-purple-500" },
  ]

  return (
    <>
      <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-50 flex flex-col items-end gap-3">
        {/* Speed Dial Menu */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}>
          {actions.map((action, i) => (
            <div key={action.id} className="flex items-center gap-3 group">
              <span className="bg-bg-secondary border border-bg-border px-2 py-1 rounded text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {action.label}
              </span>
              <button
                onClick={() => {
                  setModalType(action.id)
                  setIsOpen(false)
                }}
                className={`w-12 h-12 ${action.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            isOpen ? "rotate-45 bg-red-500" : "hover:scale-110"
          }`}
        >
          {isOpen ? <X size={28} /> : <PlusCircle size={28} />}
        </button>
      </div>

      {modalType && (
        <PostModal 
          type={modalType} 
          onClose={() => setModalType(null)} 
        />
      )}
    </>
  )
}
