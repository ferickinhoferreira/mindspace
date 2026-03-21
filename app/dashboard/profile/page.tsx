"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Save, User as UserIcon, Phone, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"
import { Grid, Bookmark, RefreshCw, Settings as SettingsIcon, MapPin, Calendar, Link as LinkIcon } from "lucide-react"
import * as Tabs from "@radix-ui/react-tabs"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    const res = await fetch("/api/profile")
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-brand" />
    </div>
  )

  if (!data) return null

  const { user, thoughts, republishes, savedPosts } = data

  return (
    <div className="min-h-screen bg-bg-base animate-fade-in pb-20">
      {/* Banner */}
      <div className="relative h-48 lg:h-64 w-full bg-bg-overlay overflow-hidden">
        {user.banner ? (
          <Image src={user.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand/20 to-pink-500/20" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-bg-base bg-bg-base overflow-hidden shadow-xl ring-2 ring-brand/20">
                  {user.image ? (
                    <Image src={user.image} alt={user.name} width={128} height={128} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand text-4xl font-bold">
                      {user.name?.[0] || "?"}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left pb-2">
                <h1 className="text-2xl lg:text-3xl font-display text-text-primary tracking-tight">{user.name}</h1>
                <p className="text-text-muted text-sm mt-1">@{user.id.slice(0, 8)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 pb-2">
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-bg-overlay border border-bg-border text-sm font-semibold hover:bg-bg-border transition-all"
              >
                <SettingsIcon size={16} />
                Editar Perfil
              </Link>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {user.bio && (
              <p className="text-text-secondary text-sm lg:text-base leading-relaxed max-w-2xl text-center sm:text-left">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Entrou em Março 2026</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-8 py-4 border-t border-b border-bg-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-sm font-bold text-text-primary">{user._count.thoughts}</span>
                <span className="text-xs text-text-muted">Publicações</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-sm font-bold text-text-primary">{user._count.followers}</span>
                <span className="text-xs text-text-muted">Seguidores</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-sm font-bold text-text-primary">{user._count.following}</span>
                <span className="text-xs text-text-muted">Seguindo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs.Root defaultValue="posts" onValueChange={setActiveTab}>
          <Tabs.List className="flex items-center justify-center gap-8 lg:gap-16 border-b border-bg-border mb-8">
            <Tabs.Trigger 
              value="posts"
              className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 hover:text-text-primary ${activeTab === "posts" ? "border-brand text-brand" : "border-transparent text-text-muted"}`}
            >
              <div className="flex items-center gap-2">
                <Grid size={16} />
                Postagens
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="reposts"
              className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 hover:text-text-primary ${activeTab === "reposts" ? "border-brand text-brand" : "border-transparent text-text-muted"}`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={16} />
                Republicados
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="saved"
              className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 hover:text-text-primary ${activeTab === "saved" ? "border-brand text-brand" : "border-transparent text-text-muted"}`}
            >
              <div className="flex items-center gap-2">
                <Bookmark size={16} />
                Salvos
              </div>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="posts" className="space-y-6">
            {thoughts.length === 0 ? (
              <div className="text-center py-20 card opacity-60">
                <p className="text-sm text-text-muted">Você ainda não postou nada.</p>
              </div>
            ) : (
              thoughts.map((thought: any) => (
                <div key={thought.id} className="card p-4 lg:p-6 rounded-2xl border hover:border-brand/30 transition-all">
                  <div className="mb-4">
                    {thought.title && <h3 className="text-lg font-display text-text-primary mb-2">{thought.title}</h3>}
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
                    {thought.mediaUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-bg-border">
                         <img src={thought.mediaUrl} alt="" className="w-full h-auto max-h-[400px] object-contain" />
                      </div>
                    )}
                  </div>
                  <ThoughtActions thought={thought} onUpdate={fetchProfile} />
                </div>
              ))
            )}
          </Tabs.Content>

          <Tabs.Content value="reposts" className="space-y-6">
            {republishes.length === 0 ? (
              <div className="text-center py-20 card opacity-60">
                <p className="text-sm text-text-muted">Nenhuma república por aqui.</p>
              </div>
            ) : (
              republishes.map((thought: any) => (
                <div key={thought.id} className="card p-4 lg:p-6 rounded-2xl border hover:border-brand/30 transition-all">
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mb-4 px-2">
                    <RefreshCw size={12} />
                    <span>Você republicou</span>
                  </div>
                  <div className="mb-4">
                    {thought.title && <h3 className="text-lg font-display text-text-primary mb-2">{thought.title}</h3>}
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
                  </div>
                  <ThoughtActions thought={thought} onUpdate={fetchProfile} />
                </div>
              ))
            )}
          </Tabs.Content>

          <Tabs.Content value="saved" className="space-y-6">
            {savedPosts.length === 0 ? (
              <div className="text-center py-20 card opacity-60">
                <p className="text-sm text-text-muted">Nenhum post salvo ainda.</p>
              </div>
            ) : (
              savedPosts.map((thought: any) => (
                <div key={thought.id} className="card p-4 lg:p-6 rounded-2xl border hover:border-brand/30 transition-all">
                  <div className="mb-4">
                    {thought.title && <h3 className="text-lg font-display text-text-primary mb-2">{thought.title}</h3>}
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
                  </div>
                  <ThoughtActions thought={thought} onUpdate={fetchProfile} />
                </div>
              ))
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}
