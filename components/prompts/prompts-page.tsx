"use client"
// components/prompts/prompts-page.tsx
import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Plus, Search, Zap, Pin, Star, SortAsc, SortDesc,
  FolderOpen, Filter, Grid3X3, List
} from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"
import { PromptEditor } from "./prompt-editor"
import { PromptCard } from "./prompt-card"
import { PromptDetail } from "./prompt-detail"

export function PromptsPage() {
  const searchParams = useSearchParams()
  const [prompts, setPrompts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(searchParams.get("new") === "true")
  const [editingPrompt, setEditingPrompt] = useState<any>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    tag: "",
    model: "",
    pinned: false,
    favorite: false,
    sort: "createdAt",
    order: "desc" as "asc" | "desc",
  })

  const fetchPrompts = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.category) params.set("category", filters.category)
    if (filters.tag) params.set("tag", filters.tag)
    if (filters.model) params.set("model", filters.model)
    if (filters.pinned) params.set("pinned", "true")
    if (filters.favorite) params.set("favorite", "true")
    params.set("sort", filters.sort)
    params.set("order", filters.order)

    const res = await fetch(`/api/prompts?${params}`)
    const data = await res.json()
    setPrompts(data.prompts || [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/tags").then(r => r.json()),
    ]).then(([catData, tagData]) => {
      setCategories(catData.categories || [])
      setTags(tagData.tags || [])
    })
  }, [])

  useEffect(() => {
    const id = searchParams.get("id")
    if (id && prompts.length > 0) {
      const found = prompts.find(p => p.id === id)
      if (found) setSelectedPrompt(found)
    }
  }, [searchParams, prompts])

  async function handleDelete(id: string) {
    await fetch(`/api/prompts/${id}`, { method: "DELETE" })
    setPrompts(prev => prev.filter(p => p.id !== id))
    if (selectedPrompt?.id === id) setSelectedPrompt(null)
  }

  async function handleTogglePin(id: string, isPinned: boolean) {
    const res = await fetch(`/api/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !isPinned }),
    })
    const data = await res.json()
    setPrompts(prev => prev.map(p => p.id === id ? data.prompt : p))
    if (selectedPrompt?.id === id) setSelectedPrompt(data.prompt)
  }

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    const res = await fetch(`/api/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !isFavorite }),
    })
    const data = await res.json()
    setPrompts(prev => prev.map(p => p.id === id ? data.prompt : p))
    if (selectedPrompt?.id === id) setSelectedPrompt(data.prompt)
  }

  async function handleCopy(prompt: any) {
    await navigator.clipboard.writeText(prompt.content)
    // Increment use count
    const res = await fetch(`/api/prompts/${prompt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incrementUse: true }),
    })
    const data = await res.json()
    setPrompts(prev => prev.map(p => p.id === prompt.id ? data.prompt : p))
    if (selectedPrompt?.id === prompt.id) setSelectedPrompt(data.prompt)
  }

  function onSaved(prompt: any) {
    if (editingPrompt) {
      setPrompts(prev => prev.map(p => p.id === prompt.id ? prompt : p))
      if (selectedPrompt?.id === prompt.id) setSelectedPrompt(prompt)
    } else {
      setPrompts(prev => [prompt, ...prev])
      setSelectedPrompt(prompt)
    }
    setShowEditor(false)
    setEditingPrompt(null)
  }

  const pinned = prompts.filter(p => p.isPinned)
  const unpinned = prompts.filter(p => !p.isPinned)

  // Get unique models in use
  const usedModels = [...new Set(prompts.filter(p => p.model).map(p => p.model))]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-80 border-r border-bg-border flex flex-col bg-bg-elevated flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-bg-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <h1 className="font-medium text-text-primary text-sm">Prompts</h1>
              <span className="text-text-muted text-xs bg-bg-overlay px-1.5 py-0.5 rounded">
                {prompts.length}
              </span>
            </div>
            <button
              onClick={() => { setEditingPrompt(null); setShowEditor(true) }}
              className="btn-primary px-2.5 py-1.5 text-xs flex items-center gap-1"
            >
              <Plus size={13} />
              Novo
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input pl-8 text-xs py-1.5"
              placeholder="Buscar prompts..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              <button
                onClick={() => setFilters(f => ({ ...f, category: "" }))}
                className={cn("text-xs px-2 py-1 rounded-md transition-colors", !filters.category ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-secondary")}
              >
                Todas
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilters(f => ({ ...f, category: f.category === c.id ? "" : c.id }))}
                  className={cn("text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1", filters.category === c.id ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-secondary")}
                >
                  <span>{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Extra filters row */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(f => ({ ...f, pinned: !f.pinned }))}
              className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors", filters.pinned ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-secondary")}
            >
              <Pin size={11} /> Fixados
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, favorite: !f.favorite }))}
              className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors", filters.favorite ? "bg-yellow-500/20 text-yellow-400" : "text-text-muted hover:text-text-secondary")}
            >
              <Star size={11} /> Favoritos
            </button>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setFilters(f => ({ ...f, sort: f.sort === "createdAt" ? "useCount" : "createdAt" }))}
                className="text-xs px-2 py-1 rounded-md text-text-muted hover:text-text-secondary transition-colors"
                title={filters.sort === "createdAt" ? "Ordenar por uso" : "Ordenar por data"}
              >
                {filters.sort === "createdAt" ? "📅" : "🔥"}
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, order: f.order === "desc" ? "asc" : "desc" }))}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-text-muted hover:text-text-secondary transition-colors"
              >
                {filters.order === "desc" ? <SortDesc size={11} /> : <SortAsc size={11} />}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-3 animate-pulse">
                <div className="h-3 bg-bg-border rounded w-3/4 mb-2" />
                <div className="h-2 bg-bg-border rounded w-1/2" />
              </div>
            ))
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <Zap size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-text-muted text-sm">Nenhum prompt</p>
              <button
                onClick={() => setShowEditor(true)}
                className="text-brand text-xs mt-2 hover:underline"
              >
                Criar primeiro
              </button>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="label px-2 py-1">📌 Fixados</p>
                  {pinned.map(p => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      selected={selectedPrompt?.id === p.id}
                      onClick={() => setSelectedPrompt(p)}
                      onEdit={() => { setEditingPrompt(p); setShowEditor(true) }}
                      onDelete={() => handleDelete(p.id)}
                      onPin={() => handleTogglePin(p.id, p.isPinned)}
                      onFavorite={() => handleToggleFavorite(p.id, p.isFavorite)}
                      onCopy={() => handleCopy(p)}
                    />
                  ))}
                  {unpinned.length > 0 && <p className="label px-2 py-1 pt-3">Outros</p>}
                </>
              )}
              {unpinned.map(p => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  selected={selectedPrompt?.id === p.id}
                  onClick={() => setSelectedPrompt(p)}
                  onEdit={() => { setEditingPrompt(p); setShowEditor(true) }}
                  onDelete={() => handleDelete(p.id)}
                  onPin={() => handleTogglePin(p.id, p.isPinned)}
                  onFavorite={() => handleToggleFavorite(p.id, p.isFavorite)}
                  onCopy={() => handleCopy(p)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          <PromptEditor
            prompt={editingPrompt}
            tags={tags}
            categories={categories}
            onSaved={onSaved}
            onCancel={() => { setShowEditor(false); setEditingPrompt(null) }}
            onCategoriesChange={setCategories}
          />
        ) : selectedPrompt ? (
          <PromptDetail
            prompt={selectedPrompt}
            onEdit={() => { setEditingPrompt(selectedPrompt); setShowEditor(true) }}
            onDelete={() => handleDelete(selectedPrompt.id)}
            onPin={() => handleTogglePin(selectedPrompt.id, selectedPrompt.isPinned)}
            onFavorite={() => handleToggleFavorite(selectedPrompt.id, selectedPrompt.isFavorite)}
            onCopy={() => handleCopy(selectedPrompt)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
              <Zap size={28} className="text-yellow-400/60" />
            </div>
            <h2 className="font-display text-xl text-text-primary mb-2">Sua biblioteca de prompts</h2>
            <p className="text-text-muted text-sm max-w-xs leading-relaxed mb-6">
              Salve, organize e acesse seus melhores prompts com um clique para copiar.
            </p>
            <button
              onClick={() => setShowEditor(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} />
              Novo prompt
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
