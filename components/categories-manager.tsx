"use client"
// components/categories-manager.tsx
import { useEffect, useState } from "react"
import { Plus, Trash2, FolderOpen, Edit3, Check, X, Zap } from "lucide-react"
import { TAG_COLORS } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const CAT_ICONS = ["📁", "✍️", "⚡", "🔍", "🎨", "💻", "🌟", "🧠", "📊", "🎯", "🛠️", "🌐", "📝", "🔥", "💡", "🎬", "📸", "🎵", "🏆", "🔮"]
const CAT_COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1"]

export function CategoriesManager() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", description: "", icon: "📁", color: CAT_COLORS[0] })
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", icon: "", color: "" })

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { setCategories(d.categories || []); setLoading(false) })
  }, [])

  async function createCategory() {
    if (!form.name.trim()) return
    setCreating(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.category) {
      setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)))
      setForm({ name: "", description: "", icon: "📁", color: CAT_COLORS[0] })
      toast({ title: "Categoria criada!" })
    } else {
      toast({ title: data.error || "Erro ao criar", variant: "destructive" })
    }
    setCreating(false)
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
    setCategories(prev => prev.filter(c => c.id !== id))
    toast({ title: "Categoria removida" })
  }

  async function saveEdit(id: string) {
    const res = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    })
    if (res.ok) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...editForm } : c))
      setEditingId(null)
      toast({ title: "Categoria atualizada!" })
    }
  }

  function startEdit(cat: any) {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "📁", color: cat.color })
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FolderOpen size={18} className="text-brand" />
          <h1 className="font-display text-2xl text-text-primary">Categorias de Prompts</h1>
        </div>
        <p className="text-text-muted text-sm">Agrupe seus prompts em categorias para encontrá-los facilmente</p>
      </div>

      {/* Create form */}
      <div className="card p-5 mb-6">
        <p className="label mb-3">Nova categoria</p>
        <div className="flex gap-2 mb-3">
          <input
            className="input flex-1"
            placeholder="Nome da categoria..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && createCategory()}
          />
          <button
            onClick={createCategory}
            disabled={creating || !form.name.trim()}
            className="btn-primary flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus size={14} />
            Criar
          </button>
        </div>
        <input
          className="input mb-3 text-sm"
          placeholder="Descrição (opcional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label mb-2">Ícone</p>
            <div className="flex gap-1 flex-wrap">
              {CAT_ICONS.map(ico => (
                <button
                  key={ico}
                  onClick={() => setForm(f => ({ ...f, icon: ico }))}
                  className={`text-base p-1.5 rounded-md transition-all hover:bg-bg-surface ${form.icon === ico ? "bg-brand/20 ring-1 ring-brand/30" : ""}`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-2">Cor</p>
            <div className="flex gap-1.5 flex-wrap">
              {CAT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                />
              ))}
            </div>
            {form.name && (
              <div className="mt-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1.5"
                  style={{ backgroundColor: form.color + "20", color: form.color, border: `1px solid ${form.color}40` }}
                >
                  {form.icon} {form.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted">Nenhuma categoria criada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="card p-4 group">
              {editingId === cat.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="input flex-1 text-sm"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <button onClick={() => saveEdit(cat.id)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-text-muted hover:bg-bg-surface rounded">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {CAT_ICONS.map(ico => (
                      <button
                        key={ico}
                        onClick={() => setEditForm(f => ({ ...f, icon: ico }))}
                        className={`text-sm p-1 rounded transition-all ${editForm.icon === ico ? "bg-brand/20" : "hover:bg-bg-surface"}`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    <span className="text-base">{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: cat.color }}
                      >
                        {cat.name}
                      </span>
                      <span className="text-xs text-text-muted bg-bg-overlay px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Zap size={10} /> {cat._count?.prompts || 0}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-text-muted text-xs truncate mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
