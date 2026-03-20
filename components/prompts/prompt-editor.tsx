"use client"
// components/prompts/prompt-editor.tsx
import { useState, useEffect } from "react"
import { Loader2, Save, X, Eye, Edit3, Plus } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { TAG_COLORS, PROMPT_MODELS } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  prompt?: any
  tags: any[]
  categories: any[]
  onSaved: (prompt: any) => void
  onCancel: () => void
  onCategoriesChange: (cats: any[]) => void
}

export function PromptEditor({ prompt, tags, categories, onSaved, onCancel, onCategoriesChange }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: prompt?.title || "",
    content: prompt?.content || "",
    description: prompt?.description || "",
    model: prompt?.model || "",
    categoryId: prompt?.categoryId || "",
    tagIds: prompt?.tags?.map((t: any) => t.tagId) || [],
  })
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localTags, setLocalTags] = useState(tags)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[5])
  const [creatingTag, setCreatingTag] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("📁")
  const [newCatColor, setNewCatColor] = useState("#8b5cf6")
  const [creatingCat, setCreatingCat] = useState(false)

  useEffect(() => { setLocalTags(tags) }, [tags])

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Título e conteúdo são obrigatórios", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const url = prompt ? `/api/prompts/${prompt.id}` : "/api/prompts"
      const method = prompt ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: prompt ? "Prompt atualizado!" : "Prompt salvo!" })
      onSaved(data.prompt)
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function createTag() {
    if (!newTagName.trim()) return
    setCreatingTag(true)
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName, color: newTagColor }),
    })
    const data = await res.json()
    if (data.tag) {
      setLocalTags(prev => [...prev, data.tag])
      setForm(f => ({ ...f, tagIds: [...f.tagIds, data.tag.id] }))
      setNewTagName("")
    }
    setCreatingTag(false)
  }

  async function createCategory() {
    if (!newCatName.trim()) return
    setCreatingCat(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, icon: newCatIcon, color: newCatColor }),
    })
    const data = await res.json()
    if (data.category) {
      onCategoriesChange([...categories, data.category])
      setForm(f => ({ ...f, categoryId: data.category.id }))
      setNewCatName("")
    }
    setCreatingCat(false)
  }

  function toggleTag(id: string) {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((x: string) => x !== id) : [...f.tagIds, id],
    }))
  }

  const CAT_ICONS = ["📁", "✍️", "⚡", "🔍", "🎨", "💻", "🌟", "🧠", "📊", "🎯", "🛠️", "🌐"]

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bg-border flex-shrink-0">
        <span className="text-text-muted text-sm">
          {prompt ? "Editar prompt" : "Novo prompt"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(p => !p)}
            className={`btn-ghost flex items-center gap-1.5 text-xs ${preview ? "text-brand" : ""}`}
          >
            {preview ? <Edit3 size={13} /> : <Eye size={13} />}
            {preview ? "Editar" : "Preview"}
          </button>
          <button onClick={onCancel} className="btn-ghost p-1.5">
            <X size={15} />
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 pt-6 pb-2 space-y-2 flex-shrink-0">
            <input
              className="w-full bg-transparent text-xl font-display text-text-primary placeholder:text-text-muted/40 focus:outline-none"
              placeholder="Título do prompt"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <input
              className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none"
              placeholder="Descrição breve (opcional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="border-b border-bg-border" />
          </div>

          {preview ? (
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-4">
              <div className="md-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {form.content || "*Nada para visualizar ainda...*"}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <textarea
              className="flex-1 w-full bg-transparent px-8 pb-6 pt-4 text-text-primary text-sm leading-relaxed focus:outline-none resize-none placeholder:text-text-muted/40 font-mono"
              placeholder={`Cole ou escreva seu prompt aqui...\n\nSuporta Markdown:\n- **negrito**, _itálico_\n- \`código inline\`\n- blocos de código\n- listas, tabelas, etc.`}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              autoFocus
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-60 border-l border-bg-border bg-bg-elevated flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Category */}
            <div>
              <p className="label mb-2">Categoria</p>
              <div className="space-y-1">
                <button
                  onClick={() => setForm(f => ({ ...f, categoryId: "" }))}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${!form.categoryId ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-primary hover:bg-bg-surface"}`}
                >
                  Sem categoria
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setForm(f => ({ ...f, categoryId: c.id }))}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-all flex items-center gap-2 ${form.categoryId === c.id ? "bg-brand/20 text-brand" : "text-text-muted hover:text-text-primary hover:bg-bg-surface"}`}
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                    <span className="ml-auto text-text-muted">{c._count?.prompts}</span>
                  </button>
                ))}
              </div>

              {/* New category */}
              <div className="mt-2 space-y-1.5">
                <input
                  className="input text-xs py-1"
                  placeholder="Nova categoria..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createCategory()}
                />
                {newCatName && (
                  <>
                    <div className="flex gap-1 flex-wrap">
                      {CAT_ICONS.map(ico => (
                        <button
                          key={ico}
                          onClick={() => setNewCatIcon(ico)}
                          className={`text-sm p-1 rounded transition-all ${newCatIcon === ico ? "bg-brand/20 ring-1 ring-brand/30" : "hover:bg-bg-surface"}`}
                        >
                          {ico}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={createCategory}
                      disabled={creatingCat}
                      className="btn-secondary w-full text-xs py-1"
                    >
                      + Criar "{newCatName}"
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Model */}
            <div>
              <p className="label mb-2">Modelo / Plataforma</p>
              <select
                className="input text-xs py-1.5"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              >
                <option value="">Nenhum</option>
                {PROMPT_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <p className="label mb-2">Tags</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {localTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="text-xs px-2 py-0.5 rounded-full transition-all border"
                    style={{
                      backgroundColor: form.tagIds.includes(tag.id) ? tag.color + "30" : "transparent",
                      borderColor: form.tagIds.includes(tag.id) ? tag.color + "60" : "#1e1e2e",
                      color: form.tagIds.includes(tag.id) ? tag.color : "#8888a8",
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  className="input text-xs py-1 flex-1"
                  placeholder="Nova tag..."
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createTag()}
                />
              </div>
              {newTagName && (
                <>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewTagColor(c)}
                        className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: c, outline: newTagColor === c ? `2px solid ${c}` : "none", outlineOffset: "1px" }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={createTag}
                    disabled={creatingTag}
                    className="btn-secondary w-full mt-1.5 text-xs py-1"
                  >
                    + Criar "{newTagName}"
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
