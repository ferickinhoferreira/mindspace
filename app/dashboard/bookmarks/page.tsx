"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Bookmark, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThoughtActions } from "@/components/social/thought-actions"

export default function BookmarksPage() {
  const { data: session } = useSession()
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved || [])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-[#1e1e1e]">
        <div className="max-w-[600px] mx-auto px-4 py-4 flex items-center gap-3">
          <Bookmark size={20} className="text-[#7c6af7]" fill="currentColor" />
          <div>
            <h1 className="text-[17px] font-bold text-white">Salvos</h1>
            <p className="text-xs text-[#555]">Somente você vê isso</p>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#7c6af7]" size={28} />
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center">
              <Bookmark size={28} className="text-[#555]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Nenhum salvo ainda</h3>
              <p className="text-[#555] text-sm mt-1">
                Toque em 🔖 em qualquer postagem para salvar aqui.
              </p>
            </div>
          </div>
        ) : (
          saved.map((thought: any) => (
            <article
              key={thought.id}
              className="flex gap-3 px-4 py-4 border-b border-[#1e1e1e] hover:bg-white/[0.02] transition-colors"
            >
              <Link href={`/dashboard/profile/${thought.user?.id}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#111] ring-1 ring-[#2a2a2a]">
                  {thought.user?.image ? (
                    <Image src={thought.user.image} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#7c6af7] to-[#e040fb] flex items-center justify-center text-white font-bold">
                      {thought.user?.name?.[0] || "?"}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-bold text-[15px] text-white">{thought.user?.name || "Usuário"}</span>
                  <span className="text-[#555] text-sm">·</span>
                  <span className="text-[#555] text-sm">
                    {thought.createdAt
                      ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: false, locale: ptBR })
                      : ""}
                  </span>
                </div>
                {thought.title && (
                  <p className="font-bold text-white text-[15px] mb-1">{thought.title}</p>
                )}
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
