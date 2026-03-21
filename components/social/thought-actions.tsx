"use client"
// components/social/thought-actions.tsx
import { useState } from "react"
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Bookmark, 
  Send, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  EyeOff,
  Flag,
  Info,
  Star
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface ThoughtActionsProps {
  thought: any
  onUpdate: () => void
}

export function ThoughtActions({ thought, onUpdate }: ThoughtActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const isLiked = thought.likes?.length > 0
  const isRepublished = thought.republishes?.length > 0
  const isSaved = thought.savedBy?.length > 0
  const isFollowing = thought.user.followers?.length > 0

  async function handleAction(action: string, endpoint: string, body: any) {
    setLoading(action)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onUpdate()
      }
    } catch (error) {
      toast({ title: "Erro", description: "Ocorreu um erro ao processar a ação." })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-bg-border/50">
      <div className="flex items-center gap-5">
        {/* Like */}
        <button 
          onClick={() => handleAction("like", "/api/social/like", { thoughtId: thought.id })}
          className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? "text-red-400 font-medium" : "text-text-muted hover:text-red-400"}`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 2.5 : 2} />
          <span>{thought._count.likes}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors">
          <MessageSquare size={18} />
          <span>{thought._count.comments}</span>
        </button>

        {/* Republish */}
        <button 
          onClick={() => handleAction("republish", "/api/social/republish", { thoughtId: thought.id })}
          className={`flex items-center gap-1.5 text-xs transition-colors ${isRepublished ? "text-green-400 font-medium" : "text-text-muted hover:text-green-400"}`}
        >
          <Repeat2 size={18} strokeWidth={isRepublished ? 3 : 2} />
          <span>{thought._count.republishes}</span>
        </button>

        {/* Share (Airplane) */}
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/dashboard/feed`)
            toast({ title: "Link Copiado", description: "O link da postagem foi copiado!" })
          }}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors"
        >
          <Send size={18} className="-rotate-12 translate-y-[-1px]" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Save */}
        <button 
          onClick={() => handleAction("save", "/api/social/save", { thoughtId: thought.id })}
          className={`transition-colors ${isSaved ? "text-brand" : "text-text-muted hover:text-brand"}`}
        >
          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Options (3 dots) */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-full hover:bg-bg-base">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="bg-bg-secondary border border-bg-border rounded-xl shadow-2xl p-1.5 z-[100] min-w-[200px] animate-in slide-in-from-top-2 fade-in duration-200"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item 
                className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer"
                onSelect={() => handleAction("save", "/api/social/save", { thoughtId: thought.id })}
              >
                <Bookmark size={16} />
                {isSaved ? "Remover dos Salvos" : "Salvar"}
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer"
                onSelect={() => handleAction("republish", "/api/social/republish", { thoughtId: thought.id })}
              >
                <Repeat2 size={16} />
                Republicar
              </DropdownMenu.Item>

              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer">
                <Star size={16} />
                Adicionar aos Favoritos
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-bg-border my-1.5" />

              <DropdownMenu.Item 
                className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer"
                onSelect={() => handleAction("follow", "/api/social/follow", { followingId: thought.user.id })}
              >
                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {isFollowing ? "Deixar de Seguir" : `Seguir ${thought.user.name}`}
              </DropdownMenu.Item>

              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer">
                <EyeOff size={16} />
                Ocultar
              </DropdownMenu.Item>

              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-bg-base outline-none cursor-pointer">
                <Info size={16} />
                Sobre esta conta
              </DropdownMenu.Item>

              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 outline-none cursor-pointer">
                <Flag size={16} />
                Denunciar
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
