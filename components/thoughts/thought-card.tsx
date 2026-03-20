"use client"
// components/thoughts/thought-card.tsx
import { useState } from "react"
import { Pin, Star, Trash2, Edit3, MoreHorizontal, Globe, Lock } from "lucide-react"
import { cn, timeAgo, THOUGHT_TYPES } from "@/lib/utils"

interface Props {
  thought: any
  selected: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  onFavorite: () => void
}

export function ThoughtCard({ thought, selected, onClick, onEdit, onDelete, onPin, onFavorite }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const typeInfo = THOUGHT_TYPES.find(t => t.value === thought.type)

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group p-3 rounded-lg cursor-pointer transition-all duration-150 border",
        selected
          ? "bg-brand/10 border-brand/30 text-text-primary"
          : "border-transparent hover:bg-bg-surface hover:border-bg-border"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5 flex-shrink-0">{typeInfo?.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <p className={cn("text-sm font-medium truncate flex-1", selected ? "text-text-primary" : "text-text-primary")}>
              {thought.title || thought.content.slice(0, 35) + (thought.content.length > 35 ? "..." : "")}
            </p>
            {thought.isFavorite && <Star size={10} className="text-yellow-400 flex-shrink-0 fill-yellow-400" />}
            {thought.isPinned && <Pin size={10} className="text-brand flex-shrink-0" />}
            {thought.isPublic ? (
              <Globe size={10} className="text-brand/60 flex-shrink-0" />
            ) : (
              <Lock size={10} className="text-text-muted flex-shrink-0" />
            )}
          </div>
          {thought.title && (
            <p className="text-text-muted text-xs truncate leading-relaxed">
              {thought.content.slice(0, 50)}...
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-text-muted text-xs">{timeAgo(thought.createdAt)}</span>
            {thought.tags.length > 0 && (
              <div className="flex gap-1">
                {thought.tags.slice(0, 2).map((t: any) => (
                  <span
                    key={t.tagId}
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: t.tag.color + "20", color: t.tag.color }}
                  >
                    {t.tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions on hover */}
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-bg-surface rounded-md border border-bg-border p-0.5">
        <button
          onClick={e => { e.stopPropagation(); onPin() }}
          className={cn("p-1 rounded transition-colors", thought.isPinned ? "text-brand" : "text-text-muted hover:text-text-primary")}
          title="Fixar"
        >
          <Pin size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onFavorite() }}
          className={cn("p-1 rounded transition-colors", thought.isFavorite ? "text-yellow-400" : "text-text-muted hover:text-text-primary")}
          title="Favoritar"
        >
          <Star size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          title="Editar"
        >
          <Edit3 size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
          title="Excluir"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
