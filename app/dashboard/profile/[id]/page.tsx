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
  MessageSquare, MoreHorizontal, Mic, UserMinus, Clock
} from "lucide-react"
import { AudioPlayer } from "@/components/social/audio-player"
import { ProfileEditModal } from "@/components/social/profile-edit-modal"
import { useToast } from "@/components/ui/use-toast"

const TABS = [
  { id: "posts",   label: "Postagens",    icon: Grid3X3 },
  { id: "reposts", label: "Remix",        icon: RefreshCw },
  { id: "media",   label: "Mídia",        icon: ImageIcon },
]

export default function UserProfilePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [friendStatus, setFriendStatus] = useState<string | null>(null) // null, PENDING_SENT, PENDING_RECEIVED, ACCEPTED
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => { 
    fetchProfile()
    if (!isOwnProfile) fetchFriendStatus()
  }, [id, session?.user?.id])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await fetch(`/api/social/profile/${id}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setIsFollowing(json.isFollowing)
      }
    } catch (e) {}
    setLoading(false)
  }

  async function fetchFriendStatus() {
    if (!session?.user?.id || id === session.user.id) return
    try {
      // Check for sent requests
      const resSent = await fetch("/api/social/friends?mode=sent")
      const sent = await resSent.json()
      const sentReq = sent.find((r: any) => r.friendId === id)
      if (sentReq) {
        setFriendStatus("PENDING_SENT")
        setFriendRequestId(sentReq.id)
        return
      }

      // Check for received
      const resRec = await fetch("/api/social/friends?mode=received")
      const received = await resRec.json()
      const recReq = received.find((r: any) => r.userId === id)
      if (recReq) {
        setFriendStatus("PENDING_RECEIVED")
        setFriendRequestId(recReq.id)
        return
      }

      // Check for accepted
      const resFriends = await fetch("/api/social/friends?mode=friends")
      const friends = await resFriends.json()
      const isFriend = friends.some((f: any) => f.userId === id || f.friendId === id)
      if (isFriend) {
        setFriendStatus("ACCEPTED")
      } else {
        setFriendStatus(null)
      }
    } catch (e) {}
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

  async function handleFriendAction(action: "SEND" | "ACCEPT" | "REJECT") {
    setFriendLoading(true)
    try {
      if (action === "SEND") {
        await fetch("/api/social/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: id })
        })
        toast({ title: "Solicitação enviada!" })
      } else {
        await fetch("/api/social/friends", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: friendRequestId, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" })
        })
        toast({ title: action === "ACCEPT" ? "Solicitação aceita!" : "Solicitação removida." })
      }
      fetchFriendStatus()
    } catch (e) {
      toast({ title: "Ocorreu um erro.", variant: "destructive" })
    } finally {
      setFriendLoading(false)
    }
  }

  async function startChat() {
    const res = await fetch("/api/social/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: id })
    })
    if (res.ok) {
      router.push("/dashboard/messages")
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center mb-2">
        <UserPlus size={32} className="text-text-muted" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Usuário não encontrado</h2>
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

  const username = user.username ? `@${user.username}` : `@${user.id.slice(0, 12)}`

  return (
    <div className="min-h-screen bg-bg-base pb-24 animate-fade-in">
      {/* Back nav */}
      <div className="sticky top-0 z-40 flex items-center gap-4 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-bg-border/40">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-surface transition-colors">
          <ArrowLeft size={18} className="text-text-primary" />
        </button>
        <div>
          <h2 className="text-base font-bold text-text-primary leading-tight">{user.name}</h2>
          <p className="text-text-muted text-xs">{user._count?.thoughts ?? 0} postagens</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-40 sm:h-52 lg:h-60 w-full overflow-hidden">
        {user.banner ? (
          <Image src={user.banner} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-purple-900/40" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-base to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar + Actions row */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4 relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-bg-base shadow-2xl bg-bg-surface">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Avatar"} width={112} height={112} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-brand to-brand-alt">
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pb-1 flex-wrap justify-end">
            {!isOwnProfile && (
              <>
                {/* Chat button */}
                <button onClick={startChat} className="p-2.5 rounded-full border border-bg-border text-text-primary hover:bg-bg-surface transition-all active:scale-95 shadow-sm">
                  <MessageSquare size={18} />
                </button>

                {/* Friend Button */}
                <button
                  disabled={friendLoading}
                  onClick={() => {
                    if (!friendStatus) handleFriendAction("SEND")
                    else if (friendStatus === "PENDING_RECEIVED") handleFriendAction("ACCEPT")
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all active:scale-95 disabled:opacity-60 shadow-md ${
                    friendStatus === "ACCEPTED" 
                      ? "bg-bg-surface text-brand border border-brand/20" 
                      : friendStatus === "PENDING_SENT"
                      ? "bg-bg-surface text-text-muted border border-bg-border"
                      : "bg-brand text-white hover:bg-brand-alt"
                  }`}
                >
                  {friendLoading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      {friendStatus === "ACCEPTED" ? <><UserCheck size={16} /> Amigos</> : 
                       friendStatus === "PENDING_SENT" ? <><Clock size={16} /> Pendente</> :
                       friendStatus === "PENDING_RECEIVED" ? <><UserPlus size={16} /> Aceitar Amizade</> : 
                       <><UserPlus size={16} /> Adicionar</>}
                    </>
                  )}
                </button>
              </>
            )}

            {isOwnProfile ? (
              <button onClick={() => setShowEditModal(true)} className="px-6 py-2.5 rounded-full text-sm font-black border border-bg-border text-text-primary hover:bg-bg-surface transition-all active:scale-95 shadow-sm">
                Editar Perfil
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black transition-all active:scale-95 disabled:opacity-60 ${
                  isFollowing ? "border border-bg-border text-text-primary" : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {followLoading ? <Loader2 size={16} className="animate-spin" /> : isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">{user.name}</h1>
            <p className="text-text-muted text-sm">{username}</p>
          </div>
          {user.bio && <p className="text-text-secondary text-[15px] leading-relaxed max-w-lg">{user.bio}</p>}
          <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm">
            {joinDate && <span className="flex items-center gap-1.5"><Calendar size={14} /> Entrou em {joinDate}</span>}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1.5"><span className="font-black text-text-primary">{user._count?.following ?? 0}</span><span className="text-text-muted">Seguindo</span></span>
            <span className="flex items-center gap-1.5"><span className="font-black text-text-primary">{user._count?.followers ?? 0}</span><span className="text-text-muted">Seguidores</span></span>
            <span className="flex items-center gap-1.5"><span className="font-black text-text-primary">{user._count?.thoughts ?? 0}</span><span className="text-text-muted">Postagens</span></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-bg-border flex">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 text-sm font-black relative transition-colors ${activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 inset-x-0 h-[3px] bg-brand rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="divide-y divide-bg-border/30">
          {tabContent[activeTab]?.length === 0 ? (
            <EmptyState message="Nenhuma publicação encontrada." icon={Grid3X3} />
          ) : activeTab === "media" ? (
            <div className="grid grid-cols-3 gap-1 pt-4">
              {mediaThoughts.map((t: any) => (
                <div key={t.id} className="aspect-square relative bg-bg-surface overflow-hidden group">
                   <img src={t.mediaUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
              ))}
            </div>
          ) : (
            tabContent[activeTab]?.map((t: any) => (
              <ThoughtCard key={t.id} thought={t} profileUser={user} onUpdate={fetchProfile} />
            ))
          )}
        </div>
      </div>

      {showEditModal && <ProfileEditModal user={user} onClose={() => setShowEditModal(false)} onUpdate={fetchProfile} />}
    </div>
  )
}

function ThoughtCard({ thought, profileUser, onUpdate }: any) {
  const ago = thought.createdAt ? formatDistanceToNow(new Date(thought.createdAt), { addSuffix: true, locale: ptBR }) : null
  const displayUser = thought.user || profileUser

  return (
    <article className="py-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-bg-surface">
          {displayUser?.image ? <img src={displayUser.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white bg-brand font-bold">{displayUser?.name?.[0]}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-sm text-text-primary">{displayUser?.name}</span>
            <span className="text-text-muted text-xs">· {ago}</span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{thought.content}</p>
          {thought.mediaUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-bg-border bg-black max-h-[400px]">
              {thought.mediaType?.startsWith("video") ? (
                <video src={thought.mediaUrl} controls className="w-full max-h-[400px] object-contain" />
              ) : (
                <img src={thought.mediaUrl} className="w-full max-h-[400px] object-contain" />
              )}
            </div>
          )}
          <div className="mt-4"><ThoughtActions thought={thought} onUpdate={onUpdate} /></div>
        </div>
      </div>
    </article>
  )
}

function EmptyState({ message, icon: Icon }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center"><Icon size={24} className="text-text-muted" /></div>
      <p className="text-text-muted text-sm font-medium">{message}</p>
    </div>
  )
}
