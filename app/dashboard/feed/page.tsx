"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, TrendingUp, Compass, Home, MessageSquare, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"

export default function FeedPage() {
  const { data: session } = useSession()
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("personal") // personal, explore, trending
  const [stories, setStories] = useState<any[]>([])
  const [loadingStories, setLoadingStories] = useState(true)
  const [processingFollow, setProcessingFollow] = useState<string | null>(null)

  useEffect(() => {
    loadFeed()
    loadStories()
  }, [tab])

  async function loadStories() {
    setLoadingStories(true)
    const res = await fetch("/api/stories")
    if (res.ok) {
      const data = await res.json()
      setStories(data.stories || [])
    }
    setLoadingStories(false)
  }

  async function loadFeed() {
    setLoading(true)
    const res = await fetch(`/api/feed?type=${tab}`)
    const data = await res.json()
    setThoughts(data.thoughts || [])
    setLoading(false)
  }

  async function handleFollow(userId: string) {
    setProcessingFollow(userId)
    const res = await fetch("/api/social/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: userId }),
    })
    if (res.ok) {
      loadFeed()
    }
    setProcessingFollow(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-24 lg:pb-8">
      {/* Stories Bar */}
      <div className="flex gap-4 overflow-x-auto p-4 lg:px-0 mb-6 scrollbar-hide no-scrollbar relative">
        {/* Your Story */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div className="w-16 h-16 rounded-full p-[3px] bg-bg-overlay border-2 border-dashed border-bg-border group-hover:border-brand transition-colors flex items-center justify-center">
            {session?.user?.image ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image src={session.user.image} alt="You" fill className="object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shadow-lg">
                    +
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-bg-base flex items-center justify-center text-text-muted">
                <span className="text-xl font-bold">+</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-text-muted font-medium">Seu Story</span>
        </div>

        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-brand to-pink-500 ring-2 ring-bg-base ring-offset-0 active:scale-95 transition-transform">
              <div className="w-full h-full rounded-full bg-bg-base border-2 border-bg-base overflow-hidden">
                {story.user.image ? (
                  <Image src={story.user.image} alt={story.user.name} width={64} height={64} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                    {story.user.name?.[0]}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-text-muted font-medium truncate w-16 text-center">
              {story.user.name ? story.user.name.split(' ')[0] : "Usuário"}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 lg:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="font-display text-xl lg:text-2xl text-text-primary">Feed Social</h1>
          <div className="flex bg-bg-overlay p-1 rounded-xl border border-bg-border self-start sm:self-auto">
            <button 
              onClick={() => setTab("personal")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "personal" ? "bg-brand text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
            >
              Seguindo
            </button>
            <button 
              onClick={() => setTab("explore")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "explore" ? "bg-brand text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
            >
              Explorar
            </button>
            <button 
              onClick={() => setTab("trending")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "trending" ? "bg-brand text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
            >
              Em Alta
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand" />
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-20 card opacity-60">
            <p className="text-sm text-text-muted">Parece que não há nada por aqui ainda...</p>
          </div>
        ) : (
          thoughts.map((thought) => {
            const isFollowing = (thought.user.followers || []).length > 0
            const isMe = thought.user.id === session?.user?.id

            return (
              <div key={thought.id} className="card p-4 lg:p-6 rounded-none sm:rounded-2xl border-x-0 sm:border-x hover:border-brand/30 transition-all group">
                <div className="flex items-center justify-between mb-4 px-2 lg:px-0">
                  <div className="flex items-start gap-3 lg:gap-4 flex-1">
                    <Link href={`/dashboard/profile/${thought.user.id}`} className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-medium overflow-hidden hover:opacity-80 transition-opacity">
                       {thought.user.image ? (
                         <Image src={thought.user.image} alt={thought.user.name} width={40} height={40} />
                       ) : (
                         thought.user.name?.[0] || "?"
                       )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/profile/${thought.user.id}`} className="text-sm font-semibold text-text-primary hover:text-brand transition-colors">
                          {thought.user.name}
                        </Link>
                        <span className="text-[10px] text-text-muted">
                          • {formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-text-muted text-[10px] truncate">@{thought.user.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      disabled={!!processingFollow}
                      onClick={() => handleFollow(thought.user.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isFollowing 
                          ? "bg-bg-base text-text-muted border border-bg-border hover:bg-bg-border" 
                          : "bg-brand text-white hover:bg-brand/90"
                      }`}
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </button>
                  )}
                </div>

                <div className="mb-6 px-2 lg:px-0">
                  {thought.title && <h3 className="text-lg font-display text-text-primary mb-2 tracking-tight">{thought.title}</h3>}
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
                  {thought.mediaUrl && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-bg-border bg-bg-base/50 group-hover:border-brand/30 transition-colors shadow-inner">
                      {thought.mediaType === "video" || thought.mediaType === "short_video" ? (
                        <video src={thought.mediaUrl} controls className="w-full aspect-video object-cover outline-none" />
                      ) : (
                        <div className="relative w-full h-auto min-h-[200px] flex items-center justify-center bg-bg-overlay">
                          <img src={thought.mediaUrl} alt="Feed Content" className="w-full h-auto max-h-[500px] object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ThoughtActions thought={thought} onUpdate={loadFeed} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
