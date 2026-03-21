"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"
import { ThoughtActions } from "@/components/social/thought-actions"
import { 
  Loader2, Settings, Grid3X3, Bookmark, RefreshCw, Heart,
  Calendar, Phone, MapPin, Link as LinkIcon, Camera, Play,
  Image as ImageIcon, Check, X
} from "lucide-react"
import { useRef } from "react"

const TABS = [
  { id: "posts",    label: "Postagens",    icon: Grid3X3 },
  { id: "reposts",  label: "Remix",       icon: RefreshCw },
  { id: "saved",    label: "Salvos",       icon: Bookmark },
  { id: "media",    label: "Mídia",        icon: ImageIcon },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<boolean | string>(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("posts")
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    // only show main loader if data is null
    if (!data) setLoading(true)
    const res = await fetch("/api/profile")
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  async function handleFileUpload(file: File, field: "image" | "banner") {
    setLoading(field)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const { url } = await res.json()
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: url }),
        })
        fetchProfile()
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm">Carregando perfil...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-text-muted">
      Nenhum dado encontrado.
    </div>
  )

  const { user, thoughts, republishes, savedPosts } = data

  // Collections for each tab
  const mediaThoughts = thoughts.filter((t: any) => t.mediaUrl)
  const tabContent: Record<string, any[]> = {
    posts: thoughts,
    reposts: republishes,
    saved: savedPosts,
    media: mediaThoughts,
  }

  const joinDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: ptBR })
    : null

  const username = user.id ? `@${user.id.slice(0, 12)}` : "@mindspace"

  return (
    <div className="min-h-screen bg-bg-base pb-24 animate-fade-in">

      {/* ── Banner ── */}
      <div className="relative h-44 sm:h-56 lg:h-64 w-full overflow-hidden group">
        {user.banner ? (
          <Image src={user.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full" style={{
            background: "linear-gradient(135deg, #1a0a3e 0%, #0d1a3e 30%, #0a2a1a 60%, #1a1a0a 100%)"
          }}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, #7c6af7 0%, transparent 50%), radial-gradient(circle at 80% 20%, #e040fb 0%, transparent 40%), radial-gradient(circle at 60% 80%, #f43f5e 0%, transparent 35%)"
            }} />
          </div>
        )}
        {/* Overlay gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-base to-transparent" />
        {/* Edit banner button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          disabled={loading === "banner"}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold border border-white/20 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {loading === "banner" ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          Alterar banner
        </button>
        <input 
          ref={bannerInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "banner")}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* ── Avatar + Actions row ── */}
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-bg-base shadow-2xl">
              {user.image ? (
                <Image src={user.image} alt={user.name || "Avatar"} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white"
                  style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)" }}>
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            {/* Edit overlay */}
            <button 
              onClick={() => avatarInputRef.current?.click()}
              disabled={loading === "image"}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              {loading === "image" ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
            </button>
            <input 
              ref={avatarInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")}
            />
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-bg-border text-sm font-bold text-text-primary hover:bg-bg-surface transition-all active:scale-95"
          >
            <Settings size={14} />
            Editar perfil
          </Link>
        </div>

        {/* ── User Info ── */}
        <div className="mb-5 space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-tight">
              {user.name || "Sem nome"}
            </h1>
            <p className="text-text-muted text-sm mt-0.5">{username}</p>
          </div>

          {user.bio && (
            <p className="text-text-secondary text-sm sm:text-[15px] leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-muted text-sm">
            {joinDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="shrink-0" />
                Entrou em {joinDate}
              </span>
            )}
            {user.phoneNumber && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="shrink-0" />
                {user.phoneNumber}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            <Link href="/dashboard/friends" className="flex items-center gap-1.5 group">
              <span className="font-bold text-text-primary group-hover:underline">{user._count?.following ?? 0}</span>
              <span className="text-text-muted">Seguindo</span>
            </Link>
            <Link href="/dashboard/friends" className="flex items-center gap-1.5 group">
              <span className="font-bold text-text-primary group-hover:underline">{user._count?.followers ?? 0}</span>
              <span className="text-text-muted">Seguidores</span>
            </Link>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary">{user._count?.thoughts ?? 0}</span>
              <span className="text-text-muted">Postagens</span>
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-bg-border mb-0">
          <div className="flex items-center">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 flex-1 justify-center py-4 text-xs sm:text-sm font-bold relative transition-colors ${
                    active ? "text-text-primary" : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-t-full" style={{ background: "linear-gradient(90deg, #7c6af7, #e040fb)" }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab: Media Grid ── */}
        {activeTab === "media" && (
          <div className="pt-1">
            {mediaThoughts.length === 0 ? (
              <EmptyState message="Nenhuma mídia publicada ainda." icon={ImageIcon} />
            ) : (
              <div className="grid grid-cols-3 gap-[2px]">
                {mediaThoughts.map((t: any) => (
                  <div key={t.id} className="aspect-square relative overflow-hidden bg-bg-surface group cursor-pointer">
                    {t.mediaType === "video" || t.mediaType === "short_video" ? (
                      <>
                        <video src={t.mediaUrl} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={24} className="text-white drop-shadow-lg" />
                        </div>
                      </>
                    ) : (
                      <img src={t.mediaUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-bold">
                      <span className="flex items-center gap-1">
                        <Heart size={14} /> {t._count?.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw size={14} /> {t._count?.republishes ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Posts / Reposts / Saved ── */}
        {activeTab !== "media" && (
          <div className="divide-y divide-bg-border/40">
            {tabContent[activeTab]?.length === 0 ? (
              <EmptyState
                message={
                  activeTab === "posts" ? "Você ainda não postou nada." :
                  activeTab === "reposts" ? "Nenhuma republicação ainda." :
                  "Nenhum post salvo ainda."
                }
                icon={activeTab === "reposts" ? RefreshCw : activeTab === "saved" ? Bookmark : Grid3X3}
              />
            ) : (
              tabContent[activeTab]?.map((thought: any) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  isRepost={activeTab === "reposts"}
                  onUpdate={fetchProfile}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function ThoughtCard({ thought, isRepost, onUpdate }: { thought: any; isRepost?: boolean; onUpdate: () => void }) {
  const ago = thought.createdAt
    ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true, locale: ptBR })
    : null

  return (
    <article className="px-0 py-4 hover:bg-white/[0.02] transition-colors">
      {isRepost && (
        <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2 pl-1">
          <RefreshCw size={11} />
          <span>Você remixou</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-bg-overlay">
          {thought.user?.image ? (
            <Image src={thought.user.image} alt={thought.user.name || ""} width={40} height={40} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)", color: "#fff" }}>
              {thought.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-text-primary text-sm">{thought.user?.name}</span>
            {ago && <span className="text-text-muted text-xs">· {ago}</span>}
          </div>
          {thought.title && (
            <h3 className="font-bold text-text-primary mb-1 text-sm">{thought.title}</h3>
          )}
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap line-clamp-5">
            {thought.content}
          </p>
          {thought.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-bg-border max-h-[350px]">
              {thought.mediaType === "video" || thought.mediaType === "short_video" ? (
                <video src={thought.mediaUrl} controls className="w-full max-h-[350px] object-contain bg-black" />
              ) : (
                <img src={thought.mediaUrl} alt="" className="w-full max-h-[350px] object-contain" />
              )}
            </div>
          )}
          <div className="mt-3">
            <ThoughtActions thought={thought} onUpdate={onUpdate} />
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState({ message, icon: Icon }: { message: string; icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center">
        <Icon size={24} className="text-text-muted" />
      </div>
      <p className="text-text-muted text-sm max-w-[220px]">{message}</p>
    </div>
  )
}
