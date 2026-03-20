"use client"
// components/prompts/prompt-card.tsx
import { Pin, Star, Trash2, Edit3, Copy, Zap } from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"
import { useState } from "react"

interface Props {
  prompt: any
  selected: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  onFavorite: () => void
  onCopy: () => void
}

export function PromptCard({ prompt, selected, onClick, onEdit, onDelete, onPin, onFavorite, onCopy }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group p-3 rounded-lg cursor-pointer transition-all duration-150 border",
        selected
          ? "bg-yellow-500/10 border-yellow-500/30"
          : "border-transparent hover:bg-bg-surface hover:border-bg-border"
      )}
    >
      <div className="flex items-start gap-2">
        <Zap size={13} className={cn("mt-0.5 flex-shrink-0", selected ? "text-yellow-400" : "text-text-muted")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-sm font-medium text-text-primary truncate flex-1">
              {prompt.title}
            </p>
            {prompt.isFavorite && <Star size={10} className="text-yellow-400 flex-shrink-0 fill-yellow-400" />}
            {prompt.isPinned && <Pin size={10} className="text-brand flex-shrink-0" />}
          </div>
          {prompt.description && (
            <p className="text-text-muted text-xs truncate mb-1">{prompt.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {prompt.category && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: prompt.category.color + "20", color: prompt.category.color }}
              >
                {prompt.category.icon} {prompt.category.name}
              </span>
            )}
            {prompt.model && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-bg-overlay text-text-muted">
                {prompt.model}
              </span>
            )}
            <span className="text-text-muted text-xs ml-auto">{timeAgo(prompt.createdAt)}</span>
          </div>
          {prompt.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {prompt.tags.slice(0, 3).map((t: any) => (
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

      {/* Hover actions */}
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-bg-surface rounded-md border border-bg-border p-0.5 z-10">
        <button
          onClick={handleCopy}
          className={cn("p-1 rounded transition-colors text-xs", copied ? "text-green-400" : "text-text-muted hover:text-text-primary")}
          title="Copiar"
        >
          {copied ? "✓" : <Copy size={11} />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onPin() }}
          className={cn("p-1 rounded transition-colors", prompt.isPinned ? "text-brand" : "text-text-muted hover:text-text-primary")}
        >
          <Pin size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onFavorite() }}
          className={cn("p-1 rounded transition-colors", prompt.isFavorite ? "text-yellow-400" : "text-text-muted hover:text-text-primary")}
        >
          <Star size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
        >
          <Edit3 size={11} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
