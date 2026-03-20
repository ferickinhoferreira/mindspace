"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, UserPlus, UserCheck, Heart, MessageSquare, Globe } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function UserProfilePage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState<any>(null)
  const [thoughts, setThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [id])

  async function loadProfile() {
    setLoading(true)
    try {
      const res = await fetch(`/api/social/profile/${id}`)
      if (!res.ok) throw new Error("Erro ao carregar perfil")
      const data = await res.json()
      setUser(data.user)
      setThoughts(data.thoughts || [])
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleFollow() {
    const res = await fetch("/api/social/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id }),
    })
    if (res.ok) {
      const data = await res.json()
      setIsFollowing(data.followed)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-brand" />
    </div>
  )

  if (!user) return (
    <div className="p-8 text-center text-text-muted">Usuário não encontrado</div>
  )

  return (
    <div className="animate-fade-in">
       {/* Banner */}
       <div className="h-48 w-full bg-bg-surface relative border-b border-bg-border overflow-hidden">
          {user.banner ? (
            <Image src={user.banner} alt="Banner" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-purple-500/5" />
          )}
       </div>

       <div className="max-w-4xl mx-auto px-8">
          <div className="relative -mt-16 mb-6 flex items-end justify-between">
             <div className="relative w-32 h-32 rounded-full border-4 border-bg-base bg-bg-surface overflow-hidden shadow-2xl">
                {user.image ? (
                  <Image src={user.image} alt={user.name} width={128} height={128} className="rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-brand/10 text-brand">
                    {user.name?.[0]}
                  </div>
                )}
             </div>
             {session?.user?.id !== id && (
               <button 
                onClick={toggleFollow}
                className={`mb-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${isFollowing ? "bg-bg-overlay border border-bg-border text-text-primary hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30" : "bg-brand text-white hover:bg-brand-dim"}`}
               >
                 {isFollowing ? <><UserCheck size={16} /> Seguindo</> : <><UserPlus size={16} /> Seguir</>}
               </button>
             )}
          </div>

          <div className="mb-10">
             <h1 className="text-2xl font-display text-text-primary mb-1">{user.name}</h1>
             <p className="text-sm text-text-muted mb-4 truncate text-brand font-medium">@{user.id.slice(0, 8)}</p>
             {user.bio && <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">{user.bio}</p>}
          </div>

          <div className="border-t border-bg-border pt-8">
             <h3 className="text-sm font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Globe size={16} className="text-brand" /> Pensamentos Públicos
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {thoughts.length === 0 ? (
                  <p className="text-xs text-text-muted italic">Nenhum pensamento público ainda.</p>
                ) : (
                  thoughts.map((t) => (
                    <div key={t.id} className="card p-4 hover:border-brand/20 transition-all group">
                       <p className="text-sm text-text-primary mb-3 whitespace-pre-wrap">{t.content}</p>
                       <div className="flex items-center gap-4 text-[10px] text-text-muted">
                          <span className="flex items-center gap-1"><Heart size={12} /> {t._count.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={12} /> {t._count.comments}</span>
                          <span className="ml-auto">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: ptBR })}</span>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
       </div>
    </div>
  )
}
