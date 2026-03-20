"use client"
// components/layout/dashboard-home.tsx
import { useEffect, useState } from "react"
import Link from "next/link"
import { Brain, Zap, Tag, FolderOpen, Pin, Star, ArrowRight, Clock } from "lucide-react"
import { timeAgo, THOUGHT_TYPES } from "@/lib/utils"

interface Stats {
  totalThoughts: number
  totalPrompts: number
  totalTags: number
  totalCategories: number
  pinnedThoughts: number
  pinnedPrompts: number
}

export function DashboardHome({ user }: { user: { name?: string | null } }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentThoughts, setRecentThoughts] = useState<any[]>([])
  const [recentPrompts, setRecentPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats)
        setRecentThoughts(d.recentThoughts || [])
        setRecentPrompts(d.recentPrompts || [])
        setLoading(false)
      })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const firstName = user.name?.split(" ")[0] || "você"

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text-primary mb-1">
          {greeting}, {firstName} ✦
        </h1>
        <p className="text-text-muted text-sm">Sua área de trabalho pessoal</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Pensamentos", value: stats?.totalThoughts, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", href: "/dashboard/thoughts" },
          { label: "Prompts", value: stats?.totalPrompts, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", href: "/dashboard/prompts" },
          { label: "Tags", value: stats?.totalTags, icon: Tag, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", href: "/dashboard/tags" },
          { label: "Categorias", value: stats?.totalCategories, icon: FolderOpen, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", href: "/dashboard/categories" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <div className={`card card-hover p-4 border ${s.bg} cursor-pointer`}>
              <div className="flex items-start justify-between mb-3">
                <s.icon size={18} className={s.color} />
              </div>
              <div className={`text-2xl font-bold font-display ${s.color} mb-0.5`}>
                {loading ? "—" : s.value ?? 0}
              </div>
              <div className="text-text-muted text-xs">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/dashboard/thoughts?new=true">
          <div className="card card-hover p-5 cursor-pointer group border-brand/10 hover:border-brand/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center">
                <Brain size={16} className="text-brand" />
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-text-primary font-medium text-sm mb-1">Novo Pensamento</h3>
            <p className="text-text-muted text-xs leading-relaxed">Ideias, notas, planos, poemas, textos e diário</p>
          </div>
        </Link>
        <Link href="/dashboard/prompts?new=true">
          <div className="card card-hover p-5 cursor-pointer group border-yellow-500/10 hover:border-yellow-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap size={16} className="text-yellow-400" />
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-text-primary font-medium text-sm mb-1">Novo Prompt</h3>
            <p className="text-text-muted text-xs leading-relaxed">Salve prompts com categorias e tags</p>
          </div>
        </Link>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent thoughts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary font-medium text-sm flex items-center gap-2">
              <Clock size={14} className="text-text-muted" />
              Pensamentos recentes
            </h2>
            <Link href="/dashboard/thoughts" className="text-brand text-xs hover:text-brand-dim flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-3 animate-pulse">
                  <div className="h-3 bg-bg-border rounded w-3/4 mb-2" />
                  <div className="h-2 bg-bg-border rounded w-1/2" />
                </div>
              ))
            ) : recentThoughts.length === 0 ? (
              <div className="card p-4 text-center">
                <p className="text-text-muted text-sm">Nenhum pensamento ainda</p>
                <Link href="/dashboard/thoughts?new=true" className="text-brand text-xs mt-1 block">
                  Criar primeiro →
                </Link>
              </div>
            ) : (
              recentThoughts.map((t) => {
                const typeInfo = THOUGHT_TYPES.find((x) => x.value === t.type)
                return (
                  <Link key={t.id} href={`/dashboard/thoughts?id=${t.id}`}>
                    <div className="card card-hover p-3 cursor-pointer">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{typeInfo?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">
                            {t.title || t.content.slice(0, 40) + "..."}
                          </p>
                          <p className="text-text-muted text-xs mt-0.5">{timeAgo(t.createdAt)}</p>
                        </div>
                        {t.isPinned && <Pin size={11} className="text-brand mt-1 flex-shrink-0" />}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Recent prompts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary font-medium text-sm flex items-center gap-2">
              <Clock size={14} className="text-text-muted" />
              Prompts recentes
            </h2>
            <Link href="/dashboard/prompts" className="text-brand text-xs hover:text-brand-dim flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-3 animate-pulse">
                  <div className="h-3 bg-bg-border rounded w-3/4 mb-2" />
                  <div className="h-2 bg-bg-border rounded w-1/2" />
                </div>
              ))
            ) : recentPrompts.length === 0 ? (
              <div className="card p-4 text-center">
                <p className="text-text-muted text-sm">Nenhum prompt ainda</p>
                <Link href="/dashboard/prompts?new=true" className="text-brand text-xs mt-1 block">
                  Criar primeiro →
                </Link>
              </div>
            ) : (
              recentPrompts.map((p) => (
                <Link key={p.id} href={`/dashboard/prompts?id=${p.id}`}>
                  <div className="card card-hover p-3 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <Zap size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-bg-overlay text-text-muted">
                              {p.category.icon} {p.category.name}
                            </span>
                          )}
                          <span className="text-text-muted text-xs">{timeAgo(p.createdAt)}</span>
                        </div>
                      </div>
                      {p.isFavorite && <Star size={11} className="text-yellow-400 mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
