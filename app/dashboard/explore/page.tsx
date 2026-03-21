"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Compass, Loader2, TrendingUp, Hash, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"
import { AudioPlayer } from "@/components/social/audio-player"

export default function ExplorePage() {
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"trending" | "explore">("trending")
  const [users, setUsers] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  async function load() {
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        handleSearch()
      } else {
        setUsers([])
        setSearching(false)
        load()
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  async function handleSearch() {
    setSearching(true)
    try {
      const res = await fetch(`/api/social/search?q=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setThoughts(data.thoughts || [])
      }
    } finally {
      setSearching(false)
    }
  }

  const filtered = search.trim() && !searching ? thoughts : thoughts

  return (
    <div className="w-full min-h-screen animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-[#1e1e1e]">
        {/* Search bar */}
        <div className="max-w-[600px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 bg-[#111] border border-[#2a2a2a] rounded-full px-4 py-2.5">
            <Search size={16} className="text-[#555] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar publicações, pessoas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-[#555] outline-none"
            />
          </div>
        </div>

        {/* Tabs - Only show when not searching or searching for something small */}
        {!search.trim() && (
          <div className="max-w-[600px] mx-auto flex">
            {([
              { id: "trending", label: "Em Alta", icon: TrendingUp },
              { id: "explore",  label: "Explorar", icon: Compass },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all relative ${
                  tab === t.id ? "text-white" : "text-[#555] hover:text-[#888]"
                }`}
              >
                <t.icon size={15} />
                {t.label}
                {tab === t.id && (
                  <div className="absolute bottom-0 inset-x-10 h-[3px] bg-[#7c6af7] rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="max-w-[600px] mx-auto">
        {(loading || searching) ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#7c6af7]" size={28} />
          </div>
        ) : (
          <>
            {/* User Search Results */}
            {search.trim() && users.length > 0 && (
              <div className="border-b border-[#1e1e1e] py-2">
                <h2 className="px-4 py-3 text-xs font-black text-[#555] uppercase tracking-widest">Pessoas</h2>
                <div className="divide-y divide-[#1e1e1e]/50">
                  {users.map(u => (
                    <Link 
                      key={u.id} 
                      href={`/dashboard/profile/${u.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#111] ring-1 ring-[#2a2a2a] group-hover:ring-[#7c6af7]/50 transition-all">
                        {u.image ? (
                          <Image src={u.image} alt="" width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#7c6af7] to-[#e040fb] flex items-center justify-center text-white font-bold">
                            {u.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white group-hover:text-[#7c6af7] transition-colors truncate">{u.name}</p>
                        <p className="text-[#555] text-xs truncate">@{u.username || u.id.slice(0, 10)}</p>
                        {u.bio && <p className="text-[#888] text-xs mt-0.5 line-clamp-1 italic">{u.bio}</p>}
                      </div>
                      <div className="text-[10px] bg-[#1e1e1e] text-[#888] px-2 py-1 rounded-full font-bold">
                        {u._count?.followers || 0} seguidores
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {search.trim() && thoughts.length > 0 && (
              <h2 className="px-4 py-4 text-xs font-black text-[#555] uppercase tracking-widest border-b border-[#1e1e1e]">Publicações</h2>
            )}

            {thoughts.length === 0 && !users.length ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center text-3xl">
                  🔍
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Nada encontrado</h3>
                  <p className="text-[#555] text-sm mt-1">Tente uma pesquisa diferente.</p>
                </div>
              </div>
            ) : (
              thoughts.map((thought) => (
                <article
                  key={thought.id}
                  className="flex gap-3 px-4 py-4 border-b border-[#1e1e1e] hover:bg-white/[0.02] transition-colors"
                >
                  <Link href={`/dashboard/profile/${thought.user.id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#111] ring-1 ring-[#2a2a2a]">
                      {thought.user.image ? (
                        <Image src={thought.user.image} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7c6af7] to-[#e040fb] flex items-center justify-center text-white font-bold">
                          {thought.user.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-[15px] text-white">{thought.user.name}</span>
                      <span className="text-[#555] text-sm">·</span>
                      <span className="text-[#555] text-sm">
                        {thought.createdAt ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: false, locale: ptBR }) : ""}
                      </span>
                    </div>
                    <p className="text-[15px] text-[#a0a0a0] leading-[1.55] whitespace-pre-wrap break-words">
                      {thought.content}
                    </p>
                    {thought.mediaUrl && (
                      <div className="mt-3">
                        {thought.mediaType === "audio" ? (
                          <AudioPlayer src={thought.mediaUrl} className="bg-bg-surface border-[#1e1e1e]" />
                        ) : thought.mediaType === "video" || thought.mediaType === "short_video" ? (
                          <div className="rounded-2xl overflow-hidden border border-[#1e1e1e]">
                            <video src={thought.mediaUrl} controls className="w-full aspect-video object-cover" />
                          </div>
                        ) : (
                          <div className="rounded-2xl overflow-hidden border border-[#1e1e1e]">
                            <img src={thought.mediaUrl} alt="" className="w-full h-auto max-h-[400px] object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3">
                      <ThoughtActions thought={thought} onUpdate={load} />
                    </div>
                  </div>
                </article>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
