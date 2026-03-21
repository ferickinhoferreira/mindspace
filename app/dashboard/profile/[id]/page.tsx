"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"
import { ThoughtActions } from "@/components/social/thought-actions"
import {
  Loader2, UserPlus, UserCheck, Grid3X3, RefreshCw,
  Calendar, Heart, Play, Image as ImageIcon, ArrowLeft,
  MessageSquare, MoreHorizontal
} from "lucide-react"

const TABS = [
  { id: "posts",   label: "Postagens",    icon: Grid3X3 },
  { id: "reposts", label: "Remix",        icon: RefreshCw },
  { id: "media",   label: "Mídia",        icon: ImageIcon },
]

export default function UserProfilePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => { fetchProfile() }, [id])

  async function fetchProfile() {
    setLoading(true)
    const res = await fetch(`/api/social/profile/${id}`)
    if (res.ok) {
      const json = await res.json()
      setData(json)
      setIsFollowing(json.isFollowing)
    }
    setLoading(false)
  }

  async function toggleFollow() {
    setFollowLoading(true)
    const res = await fetch("/api/social/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id }),
    })
    if (res.ok) {
      const json = await res.json()
      setIsFollowing(json.followed)
      fetchProfile()
    }
    setFollowLoading(false)
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center mb-2">
        <UserPlus size={32} className="text-text-muted" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Usuário não encontrado</h2>
      <p className="text-text-muted text-sm">Esta conta pode ter sido removida ou não existe.</p>
      <button onClick={() => router.back()} className="btn-secondary mt-2">Voltar</button>
    </div>
  )

  const { user, thoughts, republishes } = data
  const isOwnProfile = session?.user?.id === id
  const mediaThoughts = thoughts.filter((t: any) => t.mediaUrl)

  const tabContent: Record<string, any[]> = {
    posts: thoughts,
    reposts: republishes,
    media: mediaThoughts,
  }

  const joinDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: ptBR })
    : null

  const username = `@${user.id.slice(0, 12)}`

  return (
    <div className="min-h-screen bg-bg-base pb-24 animate-fade-in">

      {/* ── Back nav ── */}
      <div className="sticky top-0 z-40 flex items-center gap-4 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-bg-border/40">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-surface transition-colors"
        >
          <ArrowLeft size={18} className="text-text-primary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-text-primary leading-tight">{user.name}</h2>
          <p className="text-text-muted text-xs">{user._count?.thoughts ?? 0} postagens</p>
        </div>
      </div>

      {/* ── Banner ── */}
      <div className="relative h-40 sm:h-52 lg:h-60 w-full overflow-hidden">
        {user.banner ? (
          <Image src={user.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full" style={{
            background: "linear-gradient(135deg, #0d1a3e 0%, #1a0a3e 40%, #0a1a2a 100%)"
          }}>
            <div className="absolute inset-0 opacity-25" style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, #7c6af7 0%, transparent 55%), radial-gradient(circle at 70% 30%, #e040fb 0%, transparent 45%)"
            }} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-base to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* ── Avatar + Actions row ── */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-bg-base shadow-2xl">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Avatar"} width={112} height={112} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)" }}>
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1">
            {!isOwnProfile && (
              <>
                {/* More options */}
                <button className="w-9 h-9 flex items-center justify-center rounded-full border border-bg-border hover:bg-bg-surface transition-all">
                  <MoreHorizontal size={16} className="text-text-primary" />
                </button>

                {/* Follow/Following button */}
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
                    isFollowing
                      ? "border border-bg-border text-text-primary hover:border-red-500 hover:text-red-500 hover:bg-red-500/5"
                      : "bg-white text-black hover:bg-white/90 shadow-lg"
                  }`}
                >
                  {followLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isFollowing ? (
                    <><UserCheck size={14} /> Seguindo</>
                  ) : (
                    <><UserPlus size={14} /> Seguir</>
                  )}
                </button>
              </>
            )}
          </div>
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

          {/* Metadata */}
          {joinDate && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-muted text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="shrink-0" />
                Entrou em {joinDate}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary">{user._count?.following ?? 0}</span>
              <span className="text-text-muted">Seguindo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary">{user._count?.followers ?? 0}</span>
              <span className="text-text-muted">Seguidores</span>
            </span>
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

        {/* ── Media Grid ── */}
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
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-bold">
                      <span className="flex items-center gap-1"><Heart size={14} /> {t._count?.likes ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Posts / Reposts ── */}
        {activeTab !== "media" && (
          <div className="divide-y divide-bg-border/40">
            {tabContent[activeTab]?.length === 0 ? (
              <EmptyState
                message={
                  activeTab === "posts" ? "Nenhuma publicação ainda." :
                  "Nenhuma republicação ainda."
                }
                icon={activeTab === "reposts" ? RefreshCw : Grid3X3}
              />
            ) : (
              tabContent[activeTab]?.map((thought: any) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  isRepost={activeTab === "reposts"}
                  profileUser={user}
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

function ThoughtCard({
  thought, isRepost, profileUser, onUpdate
}: {
  thought: any; isRepost?: boolean; profileUser: any; onUpdate: () => void
}) {
  const ago = thought.createdAt
    ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true, locale: ptBR })
    : null

  const displayUser = thought.user || profileUser

  return (
    <article className="px-0 py-4 hover:bg-white/[0.02] transition-colors">
      {isRepost && (
        <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2 pl-1">
          <RefreshCw size={11} />
          <span>{profileUser.name} remixou</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-bg-overlay">
          {displayUser?.image ? (
            <Image src={displayUser.image} alt={displayUser.name || ""} width={40} height={40} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)", color: "#fff" }}>
              {displayUser?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-text-primary text-sm">{displayUser?.name}</span>
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
