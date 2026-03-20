"use client"
// components/thoughts/thought-editor.tsx
import { useState, useEffect } from "react"
import { Loader2, Save, X, Eye, Edit3 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { THOUGHT_TYPES, TAG_COLORS } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  thought?: any
  tags: any[]
  onSaved: (thought: any) => void
  onCancel: () => void
}

export function ThoughtEditor({ thought, tags, onSaved, onCancel }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: thought?.title || "",
    content: thought?.content || "",
    type: thought?.type || "NOTE",
    tagIds: thought?.tags?.map((t: any) => t.tagId) || [],
  })
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[6])
  const [localTags, setLocalTags] = useState(tags)
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => { setLocalTags(tags) }, [tags])

  async function handleSave() {
    if (!form.content.trim()) {
      toast({ title: "Conteúdo é obrigatório", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const url = thought ? `/api/thoughts/${thought.id}` : "/api/thoughts"
      const method = thought ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: thought ? "Pensamento atualizado!" : "Pensamento criado!" })
      onSaved(data.thought)
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

  function toggleTag(id: string) {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((x: string) => x !== id) : [...f.tagIds, id],
    }))
  }

  const selectedType = THOUGHT_TYPES.find(t => t.value === form.type)!

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bg-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm">
            {thought ? "Editar pensamento" : "Novo pensamento"}
          </span>
          <div className="flex gap-1">
            {THOUGHT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                title={t.label}
                className={`text-sm px-2 py-1 rounded-md transition-all ${
                  form.type === t.value
                    ? "bg-brand/20 text-brand ring-1 ring-brand/30"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-surface"
                }`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
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
          <div className="px-8 pt-6 pb-3 flex-shrink-0">
            <input
              className="w-full bg-transparent text-2xl font-display text-text-primary placeholder:text-text-muted/40 focus:outline-none border-none"
              placeholder="Título (opcional)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {preview ? (
            <div className="flex-1 overflow-y-auto px-8 pb-6">
              <div className="md-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {form.content || "*Nada para visualizar ainda...*"}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <textarea
              className="flex-1 w-full bg-transparent px-8 pb-6 text-text-primary text-sm leading-relaxed focus:outline-none resize-none placeholder:text-text-muted/40 font-mono"
              placeholder={`Escreva aqui... Markdown suportado ✦\n\n# Heading\n**bold** _italic_\n- lista\n> citação\n\`\`\`código\`\`\``}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              autoFocus
            />
          )}
        </div>

        {/* Sidebar metadata */}
        <div className="w-56 border-l border-bg-border bg-bg-elevated flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Type */}
            <div>
              <p className="label mb-2">Tipo</p>
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-bg-surface border border-bg-border">
                <span>{selectedType.icon}</span>
                <span className="text-text-primary text-sm">{selectedType.label}</span>
              </div>
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
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {TAG_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      ring: newTagColor === c ? "2px solid white" : "none",
                      outline: newTagColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "1px",
                    }}
                  />
                ))}
              </div>
              {newTagName && (
                <button
                  onClick={createTag}
                  disabled={creatingTag}
                  className="btn-secondary w-full mt-2 text-xs py-1"
                >
                  + Criar "{newTagName}"
                </button>
              )}
            </div>

            {/* Markdown help */}
            <div>
              <p className="label mb-2">Markdown</p>
              <div className="text-xs text-text-muted space-y-1 font-mono">
                <div># Título</div>
                <div>**negrito**</div>
                <div>_itálico_</div>
                <div>- lista</div>
                <div>1. numerado</div>
                <div>`código`</div>
                <div>{'> citação'}</div>
                <div>---</div>
                <div>[link](url)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
