"use client"
// components/social/thought-actions.tsx
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Bookmark,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  EyeOff,
  Flag,
  Info,
  Star,
  Link2,
  Send,
  Loader2,
  SmilePlus,
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface ThoughtActionsProps {
  thought: any
  onUpdate: () => void
}

export function ThoughtActions({ thought, onUpdate }: ThoughtActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [liked, setLiked] = useState((thought.likes?.length ?? 0) > 0)
  const [likeCount, setLikeCount] = useState(thought._count?.likes ?? 0)
  const [republished, setRepublished] = useState((thought.republishes?.length ?? 0) > 0)
  const [repostCount, setRepostCount] = useState(thought._count?.republishes ?? 0)
  const [saved, setSaved] = useState((thought.savedBy?.length ?? 0) > 0)
  const [saveCount, setSaveCount] = useState(thought._count?.savedBy ?? 0)
  const [commentCount, setCommentCount] = useState(thought._count?.comments ?? 0)

  // Comment panel state
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFollowing = (thought.user?.followers || []).length > 0

  // Load comments when panel opens
  useEffect(() => {
    if (showComments) {
      loadComments()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showComments])

  async function loadComments() {
    setCommentsLoading(true)
    try {
      const res = await fetch(`/api/social/comment?thoughtId=${thought.id}`)
      if (res.ok) {
        const data = await res.json()
        // API returns newest first — reverse so oldest shows first
        setComments((data.comments || []).reverse())
      }
    } finally {
      setCommentsLoading(false)
    }
  }

  async function submitComment() {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim(), thoughtId: thought.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments(prev => [...prev, data.comment])
        setCommentText("")
        setCommentCount((c: number) => c + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike() {
    if (loading === "like") return
    setLoading("like")
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)
    try {
      const res = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) { setLiked(wasLiked); setLikeCount(wasLiked ? likeCount : likeCount - 1) }
    } catch {
      setLiked(wasLiked); setLikeCount(wasLiked ? likeCount : likeCount - 1)
    } finally { setLoading(null) }
  }

  async function handleRepost() {
    if (loading === "repost") return
    setLoading("repost")
    const wasReposted = republished
    setRepublished(!wasReposted)
    setRepostCount(wasReposted ? repostCount - 1 : repostCount + 1)
    try {
      const res = await fetch("/api/social/republish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) { setRepublished(wasReposted); setRepostCount(wasReposted ? repostCount : repostCount - 1) }
      else toast({ title: wasReposted ? "Remix removido" : "Remixado!", description: wasReposted ? "" : "A postagem foi adicionada ao seu perfil." })
    } catch { setRepublished(wasReposted) }
    finally { setLoading(null) }
  }

  async function handleSave() {
    if (loading === "save") return
    setLoading("save")
    const wasSaved = saved
    setSaved(!wasSaved)
    setSaveCount(wasSaved ? saveCount - 1 : saveCount + 1)
    try {
      const res = await fetch("/api/social/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) { setSaved(wasSaved); setSaveCount(wasSaved ? saveCount : saveCount - 1) }
      else toast({ title: wasSaved ? "Removido dos salvos" : "Salvo!", description: wasSaved ? "" : "A postagem foi salva no seu perfil." })
    } catch { setSaved(wasSaved) }
    finally { setLoading(null) }
  }

  async function handleFollow() {
    setLoading("follow")
    try {
      await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: thought.user.id }),
      })
      onUpdate()
    } finally { setLoading(null) }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." })
    }
  }

  return (
    <div>
      {/* ── Action Buttons Row ── */}
      <div className="flex items-center justify-between pt-1 -mx-1">
        {/* Left actions */}
        <div className="flex items-center gap-0.5">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
              liked ? "text-rose-500" : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"
            }`}
          >
            <Heart
              size={18}
              strokeWidth={liked ? 0 : 2}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "animate-like-pop" : "group-hover:scale-110 transition-transform"}
            />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${liked ? "text-rose-500" : "text-text-muted"}`}>
              {likeCount > 0 ? likeCount : ""}
            </span>
          </button>

          {/* Comment — toggles panel */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
              showComments ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand hover:bg-brand/10"
            }`}
          >
            <MessageCircle size={18} strokeWidth={2} fill={showComments ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${showComments ? "text-brand" : "text-text-muted"}`}>
              {commentCount > 0 ? commentCount : ""}
            </span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
              republished ? "text-emerald-500" : "text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"
            }`}
          >
            <Repeat2 size={18} strokeWidth={republished ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${republished ? "text-emerald-500" : "text-text-muted"}`}>
              {repostCount > 0 ? repostCount : ""}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="group flex items-center gap-1.5 px-2 py-1.5 rounded-full text-text-muted hover:text-sky-400 hover:bg-sky-400/10 transition-all duration-200"
          >
            <Share2 size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Right: Bookmark + More */}
        <div className="flex items-center gap-1">
          {/* Save with count */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
              saved ? "text-brand" : "text-text-muted hover:text-brand hover:bg-brand/10"
            }`}
          >
            <Bookmark size={18} strokeWidth={saved ? 0 : 2} fill={saved ? "currentColor" : "none"} />
            {saveCount > 0 && (
              <span className={`text-xs tabular-nums font-medium ${saved ? "text-brand" : "text-text-muted"}`}>
                {saveCount}
              </span>
            )}
          </button>

          {/* Options menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all duration-200">
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-bg-surface border border-bg-border rounded-2xl shadow-2xl shadow-black/60 py-2 z-[200] animate-scale-in"
                sideOffset={8}
                align="end"
              >
                <MenuItem icon={<Bookmark size={16} />} onClick={handleSave}>
                  {saved ? "Remover dos Salvos" : "Salvar publicação"}
                </MenuItem>
                <MenuItem icon={<Repeat2 size={16} />} onClick={handleRepost}>
                  {republished ? "Remover Remix" : "Remix"}
                </MenuItem>
                <MenuItem icon={<MessageCircle size={16} />} onClick={() => setShowComments(!showComments)}>
                  {showComments ? "Fechar comentários" : "Comentar"}
                </MenuItem>
                <MenuItem icon={<Star size={16} />}>Adicionar aos Favoritos</MenuItem>
                <MenuItem icon={<Link2 size={16} />} onClick={handleShare}>Copiar link</MenuItem>

                <DropdownMenu.Separator className="h-px bg-bg-border my-1.5 mx-2" />

                <MenuItem icon={isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />} onClick={handleFollow}>
                  {isFollowing ? `Deixar de seguir @${thought.user?.name?.split(" ")[0]}` : `Seguir @${thought.user?.name?.split(" ")[0]}`}
                </MenuItem>
                <MenuItem icon={<EyeOff size={16} />}>Ocultar esta postagem</MenuItem>
                <MenuItem icon={<Info size={16} />}>Sobre esta conta</MenuItem>

                <DropdownMenu.Separator className="h-px bg-bg-border my-1.5 mx-2" />
                <MenuItem icon={<Flag size={16} />} danger>Denunciar</MenuItem>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* ── Comments Panel ── */}
      {showComments && (
        <div className="mt-3 border-t border-bg-border/40 pt-3 space-y-0 animate-fade-in">

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-brand" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-center">
              <MessageCircle size={28} className="text-text-muted opacity-40" />
              <p className="text-text-muted text-sm">Nenhum comentário ainda.</p>
              <p className="text-text-muted text-xs">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="space-y-0 mb-3 max-h-[340px] overflow-y-auto no-scrollbar">
              {comments.map((c: any) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex items-center gap-2.5 pt-2">
            {/* User avatar placeholder */}
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-bg-overlay">
              <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)" }} />
            </div>

            <div className="flex-1 flex items-center gap-2 bg-bg-overlay border border-bg-border rounded-full px-4 py-2 focus-within:border-brand/60 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                placeholder="Adicione um comentário..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                maxLength={500}
              />
              {commentText.trim() && (
                <button
                  onClick={submitComment}
                  disabled={submitting}
                  className="text-brand hover:text-brand/80 transition-colors disabled:opacity-40"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────

function CommentItem({ comment }: { comment: any }) {
  const ago = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })
    : ""

  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-bg-border/30 last:border-0">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-bg-overlay">
        {comment.user?.image ? (
          <Image src={comment.user.image} alt={comment.user.name || ""} width={32} height={32} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c6af7, #e040fb)" }}>
            {comment.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-sm text-text-primary">{comment.user?.name || "Usuário"}</span>
          <span className="text-text-muted text-xs">{ago}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mt-0.5 break-words">{comment.content}</p>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <DropdownMenu.Item
      onSelect={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl mx-1.5 cursor-pointer outline-none transition-colors ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-text-primary hover:bg-bg-overlay"
      }`}
    >
      <span className={danger ? "text-red-400" : "text-text-muted"}>{icon}</span>
      {children}
    </DropdownMenu.Item>
  )
}
