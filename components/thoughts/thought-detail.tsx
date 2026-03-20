"use client"
// components/thoughts/thought-detail.tsx
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Pin, Star, Trash2, Edit3, Calendar, Tag } from "lucide-react"
import { cn, formatDate, timeAgo, THOUGHT_TYPES } from "@/lib/utils"

interface Props {
  thought: any
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  onFavorite: () => void
}

export function ThoughtDetail({ thought, onEdit, onDelete, onPin, onFavorite }: Props) {
  const typeInfo = THOUGHT_TYPES.find(t => t.value === thought.type)

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-bg-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeInfo?.icon}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: typeInfo?.color + "20", color: typeInfo?.color }}
          >
            {typeInfo?.label}
          </span>
          {thought.isPinned && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-brand/10 text-brand flex items-center gap-1">
              <Pin size={10} /> Fixado
            </span>
          )}
          {thought.isFavorite && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
              <Star size={10} className="fill-yellow-400" /> Favorito
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPin}
            className={cn("btn-ghost p-2", thought.isPinned && "text-brand")}
            title={thought.isPinned ? "Desafixar" : "Fixar"}
          >
            <Pin size={15} />
          </button>
          <button
            onClick={onFavorite}
            className={cn("btn-ghost p-2", thought.isFavorite && "text-yellow-400")}
            title={thought.isFavorite ? "Remover favorito" : "Favoritar"}
          >
            <Star size={15} className={thought.isFavorite ? "fill-yellow-400" : ""} />
          </button>
          <button onClick={onEdit} className="btn-ghost p-2" title="Editar">
            <Edit3 size={15} />
          </button>
          <button
            onClick={onDelete}
            className="btn-ghost p-2 hover:text-red-400"
            title="Excluir"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {thought.title && (
          <h1 className="font-display text-2xl text-text-primary mb-4 leading-snug">
            {thought.title}
          </h1>
        )}

        <div className="md-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {thought.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-bg-border flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <Calendar size={11} />
          <span>{formatDate(thought.createdAt)}</span>
          <span>·</span>
          <span>{timeAgo(thought.createdAt)}</span>
        </div>
        {thought.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={11} className="text-text-muted" />
            {thought.tags.map((t: any) => (
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
  )
}
