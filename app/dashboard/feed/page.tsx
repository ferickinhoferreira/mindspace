"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, TrendingUp, Compass, Home, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"

const TABS = [
  { id: "personal", label: "Para você", icon: Home },
  { id: "explore",  label: "Explorar",  icon: Compass },
  { id: "trending", label: "Em Alta",   icon: TrendingUp },
]

export default function FeedPage() {
  const { data: session } = useSession()
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("personal")
  const [stories, setStories] = useState<any[]>([])
  const [processingFollow, setProcessingFollow] = useState<string | null>(null)

  useEffect(() => {
    loadFeed()
    loadStories()
  }, [tab])

  async function loadStories() {
    const res = await fetch("/api/stories")
    if (res.ok) {
      const data = await res.json()
      setStories(data.stories || [])
    }
  }

  async function loadFeed() {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?type=${tab}`)
      if (res.ok) {
        const data = await res.json()
        setThoughts(data.thoughts || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow(userId: string) {
    setProcessingFollow(userId)
    await fetch("/api/social/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: userId }),
    })
    setProcessingFollow(null)
    loadFeed()
  }

  return (
    <div className="w-full min-h-screen animate-fade-in">
      {/* ── Tab bar (X-style, stuck to top) ── */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-bg-border-subtle">
        <div className="max-w-[600px] mx-auto flex items-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200 relative ${
                tab === t.id
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary hover:bg-white/5"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 inset-x-8 h-[3px] bg-brand rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[600px] mx-auto">
        {/* ── Stories bar (Instagram style) ── */}
        {tab === "personal" && (
          <div className="border-b border-bg-border-subtle px-4 py-4">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {/* Your story */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-bg-surface border-2 border-dashed border-bg-border group-hover:border-brand/60 transition-colors flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Você"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <span className="text-text-muted text-2xl">+</span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-brand rounded-full flex items-center justify-center border-2 border-black text-white text-xs font-bold">
                    +
                  </div>
                </div>
                <span className="text-[11px] text-text-muted font-medium">Seu Story</span>
              </div>

              {/* Others' stories */}
              {stories.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full ring-gradient p-[2.5px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-bg-surface border-2 border-black">
                      {story.user.image ? (
                        <Image
                          src={story.user.image}
                          alt={story.user.name || ""}
                          width={64}
                          height={64}
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand to-brand-alt flex items-center justify-center text-white font-bold text-xl">
                          {story.user.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium truncate w-16 text-center">
                    {story.user.name ? story.user.name.split(" ")[0] : "Usuário"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Feed ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-brand" size={28} />
          </div>
        ) : thoughts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center text-3xl">
              👋
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">Nada por aqui ainda</h3>
              <p className="text-text-muted text-sm mt-1">
                {tab === "personal"
                  ? "Siga outras pessoas para ver suas publicações aqui."
                  : "Seja o primeiro a publicar algo!"}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {thoughts.map((thought) => {
              const isFollowing = (thought.user.followers || []).length > 0
              const isMe = thought.user.id === session?.user?.id

              return (
                <article
                  key={thought.id}
                  className="flex gap-3 px-4 py-4 border-b border-bg-border-subtle hover:bg-white/[0.02] transition-colors duration-200 cursor-default"
                >
                  {/* Avatar */}
                  <Link
                    href={`/dashboard/profile/${thought.user.id}`}
                    className="flex-shrink-0 mt-0.5 group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-surface ring-1 ring-bg-border group-hover:ring-brand/50 transition-all">
                      {thought.user.image ? (
                        <Image
                          src={thought.user.image}
                          alt={thought.user.name || ""}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand to-brand-alt flex items-center justify-center text-white font-bold text-base">
                          {thought.user.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <Link
                          href={`/dashboard/profile/${thought.user.id}`}
                          className="font-bold text-[15px] text-text-primary hover:underline truncate"
                        >
                          {thought.user.name || "Usuário"}
                        </Link>
                        <CheckCircle2 size={14} className="text-brand flex-shrink-0" fill="currentColor" />
                        <span className="text-text-muted text-sm truncate">
                          @{(thought.user.name || "user").replace(/\s/g, "").toLowerCase().slice(0, 15)}
                        </span>
                        <span className="text-text-muted text-sm">·</span>
                        <span className="text-text-muted text-sm flex-shrink-0">
                          {thought.createdAt
                            ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: false, locale: ptBR })
                            : ""}
                        </span>
                      </div>

                      {/* Follow button */}
                      {!isMe && (
                        <button
                          onClick={() => handleFollow(thought.user.id)}
                          disabled={!!processingFollow}
                          className={`flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-200 active:scale-95 ${
                            isFollowing
                              ? "border-bg-border text-text-secondary hover:border-red-500 hover:text-red-400"
                              : "border-text-primary text-text-primary hover:bg-white/5"
                          }`}
                        >
                          {processingFollow === thought.user.id
                            ? "..."
                            : isFollowing
                            ? "Seguindo"
                            : "Seguir"}
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="mt-1">
                      {thought.title && (
                        <h3 className="font-bold text-[15px] text-text-primary mb-1">{thought.title}</h3>
                      )}
                      <p className="text-[15px] text-text-secondary leading-[1.55] whitespace-pre-wrap break-words">
                        {thought.content}
                      </p>

                      {/* Media */}
                      {thought.mediaUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-bg-border-subtle">
                          {thought.mediaType === "video" || thought.mediaType === "short_video" ? (
                            <video
                              src={thought.mediaUrl}
                              controls
                              className="w-full aspect-video object-cover"
                            />
                          ) : (
                            <div className="w-full bg-bg-surface">
                              <img
                                src={thought.mediaUrl}
                                alt="Mídia"
                                className="w-full h-auto max-h-[500px] object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3">
                      <ThoughtActions thought={thought} onUpdate={loadFeed} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
