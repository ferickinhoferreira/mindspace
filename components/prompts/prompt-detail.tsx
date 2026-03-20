"use client"
// components/prompts/prompt-detail.tsx
import { useState } from "react"
import { Pin, Star, Trash2, Edit3, Copy, Check, Calendar, Tag, Zap, BarChart2, FolderOpen } from "lucide-react"
import { cn, formatDate, timeAgo } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Props {
  prompt: any
  onEdit: () => void
  onDelete: () => void
  onPin: () => void
  onFavorite: () => void
  onCopy: () => void
}

export function PromptDetail({ prompt, onEdit, onDelete, onPin, onFavorite, onCopy }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-bg-border flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Zap size={16} className="text-yellow-400" />
          {prompt.category && (
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: prompt.category.color + "20", color: prompt.category.color }}
            >
              {prompt.category.icon} {prompt.category.name}
            </span>
          )}
          {prompt.model && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-bg-overlay text-text-muted">
              {prompt.model}
            </span>
          )}
          {prompt.isPinned && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-brand/10 text-brand flex items-center gap-1">
              <Pin size={10} /> Fixado
            </span>
          )}
          {prompt.useCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-bg-overlay text-text-muted flex items-center gap-1">
              <BarChart2 size={10} /> usado {prompt.useCount}x
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/25"
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado!" : "Copiar prompt"}
          </button>
          <button onClick={onPin} className={cn("btn-ghost p-2", prompt.isPinned && "text-brand")}>
            <Pin size={15} />
          </button>
          <button onClick={onFavorite} className={cn("btn-ghost p-2", prompt.isFavorite && "text-yellow-400")}>
            <Star size={15} className={prompt.isFavorite ? "fill-yellow-400" : ""} />
          </button>
          <button onClick={onEdit} className="btn-ghost p-2">
            <Edit3 size={15} />
          </button>
          <button onClick={onDelete} className="btn-ghost p-2 hover:text-red-400">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <h1 className="font-display text-2xl text-text-primary mb-2 leading-snug">
          {prompt.title}
        </h1>
        {prompt.description && (
          <p className="text-text-muted text-sm mb-5 leading-relaxed">{prompt.description}</p>
        )}

        {/* Prompt content block */}
        <div className="bg-bg-elevated border border-bg-border rounded-xl p-5 relative group">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all",
                copied ? "text-green-400 bg-green-500/10" : "text-text-muted hover:text-text-primary bg-bg-surface"
              )}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="md-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {prompt.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-bg-border flex items-center gap-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <Calendar size={11} />
          <span>{formatDate(prompt.createdAt)}</span>
          <span>·</span>
          <span>{timeAgo(prompt.createdAt)}</span>
        </div>
        {prompt.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={11} className="text-text-muted" />
            {prompt.tags.map((t: any) => (
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
