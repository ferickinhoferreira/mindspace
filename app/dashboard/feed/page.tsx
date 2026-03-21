"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, TrendingUp, Compass, Home, MessageSquare, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function FeedPage() {
  const { data: session } = useSession()
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("personal") // personal, explore, trending

  useEffect(() => {
    loadFeed()
  }, [tab])

  async function loadFeed() {
    setLoading(true)
    const res = await fetch(`/api/feed?type=${tab}`)
    const data = await res.json()
    setThoughts(data.thoughts || [])
    setLoading(false)
  }

  async function toggleLike(id: string) {
    const res = await fetch("/api/social/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thoughtId: id }),
    })
    if (res.ok) {
       // Optimistic update could go here
       loadFeed()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-24 lg:pb-8">
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
          thoughts.map((thought) => (
            <div key={thought.id} className="card p-4 lg:p-6 rounded-none sm:rounded-2xl border-x-0 sm:border-x hover:border-brand/30 transition-all group">
              <div className="flex items-start gap-3 lg:gap-4 mb-4 px-2 lg:px-0">
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

              <div className="mb-6">
                {thought.title && <h3 className="text-lg font-display text-text-primary mb-2">{thought.title}</h3>}
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
                {thought.mediaUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-bg-border bg-bg-base/50 group-hover:border-brand/30 transition-colors shadow-inner">
                    {thought.mediaType === "video" || thought.mediaType === "short_video" ? (
                      <video 
                        src={thought.mediaUrl} 
                        controls 
                        className="w-full aspect-video object-cover outline-none" 
                      />
                    ) : (
                      <div className="relative w-full h-auto min-h-[200px] flex items-center justify-center bg-bg-overlay">
                        <img 
                          src={thought.mediaUrl} 
                          alt="Feed Content" 
                          className="w-full h-auto max-h-[500px] object-contain" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-bg-border/50">
                <button 
                  onClick={() => toggleLike(thought.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${thought.likes?.length > 0 ? "text-red-400 font-medium" : "text-text-muted hover:text-red-400"}`}
                >
                  <Heart size={16} fill={thought.likes?.length > 0 ? "currentColor" : "none"} />
                  {thought._count.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors">
                  <MessageSquare size={16} />
                  {thought._count.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors ml-auto">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
