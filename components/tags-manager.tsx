"use client"
// components/tags-manager.tsx
import { useEffect, useState } from "react"
import { Plus, Trash2, Tag, Edit3, Check, X } from "lucide-react"
import { TAG_COLORS } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export function TagsManager() {
  const { toast } = useToast()
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(TAG_COLORS[6])
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    fetch("/api/tags")
      .then(r => r.json())
      .then(d => { setTags(d.tags || []); setLoading(false) })
  }, [])

  async function createTag() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor }),
    })
    const data = await res.json()
    if (data.tag) {
      setTags(prev => [...prev, data.tag].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName("")
      toast({ title: "Tag criada!" })
    }
    setCreating(false)
  }

  async function deleteTag(id: string) {
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" })
    setTags(prev => prev.filter(t => t.id !== id))
    toast({ title: "Tag removida" })
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={18} className="text-brand" />
          <h1 className="font-display text-2xl text-text-primary">Tags</h1>
        </div>
        <p className="text-text-muted text-sm">Organize seus pensamentos e prompts com tags coloridas</p>
      </div>

      {/* Create */}
      <div className="card p-4 mb-6">
        <p className="label mb-3">Nova tag</p>
        <div className="flex gap-2 items-center">
          <input
            className="input flex-1"
            placeholder="Nome da tag..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createTag()}
          />
          <button
            onClick={createTag}
            disabled={creating || !newName.trim()}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} />
            Criar
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {TAG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex-shrink-0"
              style={{
                backgroundColor: c,
                outline: newColor === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
          {newName && (
            <span
              className="ml-2 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: newColor + "25", color: newColor, border: `1px solid ${newColor}40` }}
            >
              {newName}
            </span>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-bg-border" />
              <div className="h-3 bg-bg-border rounded w-32" />
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted">Nenhuma tag criada ainda</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="card p-3.5 flex items-center gap-3 group"
            >
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span
                className="text-sm px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: tag.color + "20", color: tag.color }}
              >
                {tag.name}
              </span>
              <div className="flex-1" />
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
