"use client"
// components/thoughts/thoughts-page.tsx
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Plus, Search, Filter, Pin, Star, Trash2, Edit3, X,
  LayoutGrid, List, SortAsc, SortDesc, Brain
} from "lucide-react"
import { cn, timeAgo, THOUGHT_TYPES } from "@/lib/utils"
import { ThoughtEditor } from "./thought-editor"
import { ThoughtCard } from "./thought-card"
import { ThoughtDetail } from "./thought-detail"

export function ThoughtsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [thoughts, setThoughts] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showEditor, setShowEditor] = useState(searchParams.get("new") === "true")
  const [editingThought, setEditingThought] = useState<any>(null)
  const [selectedThought, setSelectedThought] = useState<any>(null)
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL",
    tag: "",
    pinned: false,
    favorite: false,
    sort: "createdAt",
    order: "desc" as "asc" | "desc",
  })

  const fetchThoughts = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.type !== "ALL") params.set("type", filters.type)
    if (filters.tag) params.set("tag", filters.tag)
    if (filters.pinned) params.set("pinned", "true")
    if (filters.favorite) params.set("favorite", "true")
    params.set("sort", filters.sort)
    params.set("order", filters.order)

    const res = await fetch(`/api/thoughts?${params}`)
    const data = await res.json()
    setThoughts(data.thoughts || [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchThoughts() }, [fetchThoughts])
  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(d => setTags(d.tags || []))
  }, [])

  // Open from URL param
  useEffect(() => {
    const id = searchParams.get("id")
    if (id && thoughts.length > 0) {
      const found = thoughts.find(t => t.id === id)
      if (found) setSelectedThought(found)
    }
  }, [searchParams, thoughts])

  async function handleDelete(id: string) {
    await fetch(`/api/thoughts/${id}`, { method: "DELETE" })
    setThoughts(prev => prev.filter(t => t.id !== id))
    if (selectedThought?.id === id) setSelectedThought(null)
  }

  async function handleTogglePin(id: string, isPinned: boolean) {
    const res = await fetch(`/api/thoughts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !isPinned }),
    })
    const data = await res.json()
    setThoughts(prev => prev.map(t => t.id === id ? data.thought : t))
    if (selectedThought?.id === id) setSelectedThought(data.thought)
  }

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    const res = await fetch(`/api/thoughts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !isFavorite }),
    })
    const data = await res.json()
    setThoughts(prev => prev.map(t => t.id === id ? data.thought : t))
    if (selectedThought?.id === id) setSelectedThought(data.thought)
  }

  function onSaved(thought: any) {
    if (editingThought) {
      setThoughts(prev => prev.map(t => t.id === thought.id ? thought : t))
      if (selectedThought?.id === thought.id) setSelectedThought(thought)
    } else {
      setThoughts(prev => [thought, ...prev])
      setSelectedThought(thought)
    }
    setShowEditor(false)
    setEditingThought(null)
  }

  const pinned = thoughts.filter(t => t.isPinned)
  const unpinned = thoughts.filter(t => !t.isPinned)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-80 border-r border-bg-border flex flex-col bg-bg-elevated flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-bg-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-brand" />
              <h1 className="font-medium text-text-primary text-sm">Pensamentos</h1>
              <span className="text-text-muted text-xs bg-bg-overlay px-1.5 py-0.5 rounded">
                {thoughts.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setView(v => v === "grid" ? "list" : "grid")} className="btn-ghost p-1.5">
                {view === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
              </button>
              <button
                onClick={() => { setEditingThought(null); setShowEditor(true) }}
                className="btn-primary px-2.5 py-1.5 text-xs flex items-center gap-1"
              >
                <Plus size={13} />
                Novo
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input pl-8 text-xs py-1.5"
              placeholder="Buscar pensamentos..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilters(f => ({ ...f, type: "ALL" }))}
              className={cn("text-xs px-2 py-1 rounded-md transition-colors", filters.type === "ALL" ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-secondary")}
            >
              Todos
            </button>
            {THOUGHT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setFilters(f => ({ ...f, type: f.type === t.value ? "ALL" : t.value }))}
                className={cn("text-xs px-2 py-1 rounded-md transition-colors", filters.type === t.value ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-secondary")}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Extra filters */}
          <div className="flex gap-1 mt-2">
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
            <button
              onClick={() => setFilters(f => ({ ...f, order: f.order === "desc" ? "asc" : "desc" }))}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-text-muted hover:text-text-secondary transition-colors ml-auto"
            >
              {filters.order === "desc" ? <SortDesc size={11} /> : <SortAsc size={11} />}
            </button>
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
          ) : thoughts.length === 0 ? (
            <div className="text-center py-12">
              <Brain size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-text-muted text-sm">Nenhum pensamento</p>
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
                  {pinned.map(t => (
                    <ThoughtCard
                      key={t.id}
                      thought={t}
                      selected={selectedThought?.id === t.id}
                      onClick={() => setSelectedThought(t)}
                      onEdit={() => { setEditingThought(t); setShowEditor(true) }}
                      onDelete={() => handleDelete(t.id)}
                      onPin={() => handleTogglePin(t.id, t.isPinned)}
                      onFavorite={() => handleToggleFavorite(t.id, t.isFavorite)}
                    />
                  ))}
                  {unpinned.length > 0 && <p className="label px-2 py-1 pt-3">Outros</p>}
                </>
              )}
              {unpinned.map(t => (
                <ThoughtCard
                  key={t.id}
                  thought={t}
                  selected={selectedThought?.id === t.id}
                  onClick={() => setSelectedThought(t)}
                  onEdit={() => { setEditingThought(t); setShowEditor(true) }}
                  onDelete={() => handleDelete(t.id)}
                  onPin={() => handleTogglePin(t.id, t.isPinned)}
                  onFavorite={() => handleToggleFavorite(t.id, t.isFavorite)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {showEditor ? (
          <ThoughtEditor
            thought={editingThought}
            tags={tags}
            onSaved={onSaved}
            onCancel={() => { setShowEditor(false); setEditingThought(null) }}
          />
        ) : selectedThought ? (
          <ThoughtDetail
            thought={selectedThought}
            onEdit={() => { setEditingThought(selectedThought); setShowEditor(true) }}
            onDelete={() => handleDelete(selectedThought.id)}
            onPin={() => handleTogglePin(selectedThought.id, selectedThought.isPinned)}
            onFavorite={() => handleToggleFavorite(selectedThought.id, selectedThought.isFavorite)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <Brain size={28} className="text-brand/60" />
            </div>
            <h2 className="font-display text-xl text-text-primary mb-2">Seus pensamentos</h2>
            <p className="text-text-muted text-sm max-w-xs leading-relaxed mb-6">
              Selecione um pensamento para ler, ou crie um novo para começar a capturar suas ideias.
            </p>
            <button
              onClick={() => setShowEditor(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} />
              Novo pensamento
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
