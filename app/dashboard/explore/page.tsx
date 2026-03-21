"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Compass, Loader2, TrendingUp, Hash, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"

export default function ExplorePage() {
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"trending" | "explore">("trending")

  useEffect(() => {
    load()
  }, [tab])

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

  const filtered = search.trim()
    ? thoughts.filter((t) =>
        t.content?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : thoughts

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

        {/* Tabs */}
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
      </div>

      {/* Feed */}
      <div className="max-w-[600px] mx-auto">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#7c6af7]" size={28} />
          </div>
        ) : filtered.length === 0 ? (
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
          filtered.map((thought) => (
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
                  <div className="mt-3 rounded-2xl overflow-hidden border border-[#1e1e1e]">
                    <img src={thought.mediaUrl} alt="" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}
                <div className="mt-3">
                  <ThoughtActions thought={thought} onUpdate={load} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
