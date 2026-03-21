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
  Reply,
  HeartOff,
  Pencil,
  Trash2,
  Archive,
  ArrowUpRight,
  X,
  Mic,
  Send as SendIcon,
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { PostModal } from "./post-modal"
import { ShareModal } from "./share-modal" // Added
import { AudioRecorder } from "./audio-recorder"
import { AudioPlayer } from "./audio-player"
import { useSession } from "next-auth/react"

interface ThoughtActionsProps {
  thought: any
  onUpdate: () => void
}

export function ThoughtActions({ thought, onUpdate }: ThoughtActionsProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  // Basic stats
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
  const [replyTo, setReplyTo] = useState<any | null>(null)
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false) 
  const [showCommentRecorder, setShowCommentRecorder] = useState(false)
  const [commentAudioUrl, setCommentAudioUrl] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const isOwner = session?.user?.id === thought.userId
  const isFollowing = (thought.user?.followers || []).length > 0

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
        setComments(data.comments || [])
      }
    } finally {
      setCommentsLoading(false)
    }
  }

  async function submitComment() {
    if ((!commentText.trim() && !commentAudioUrl) || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: commentText.trim(), 
          thoughtId: thought.id,
          parentCommentId: replyTo?.id || null,
          mediaUrl: commentAudioUrl || undefined,
          mediaType: commentAudioUrl ? "audio" : undefined
        }),
      })
      if (res.ok) {
        loadComments()
        setCommentText("")
        setReplyTo(null)
        setCommentAudioUrl(null)
        setCommentCount((c: number) => c + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAudioComment(blob: Blob) {
    setShowCommentRecorder(false)
    setSubmitting(true)
    try {
      const file = new File([blob], "comment-voice.webm", { type: "audio/webm" })
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setCommentAudioUrl(url)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleCreatorHeart(commentId: string, currentStatus: boolean) {
    if (!isOwner) return
    try {
      const res = await fetch("/api/social/comment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, likedByCreator: !currentStatus }),
      })
      if (res.ok) {
        setComments(prev => prev.map(c => {
          if (c.id === commentId) return { ...c, likedByCreator: !currentStatus }
          return c
        }))
        toast({ title: !currentStatus ? "Coração do criador adicionado!" : "Coração removido." })
      }
    } catch {}
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return
    setLoading("delete")
    try {
      const res = await fetch(`/api/thoughts/${thought.id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Publicação excluída com sucesso." })
        onUpdate()
      }
    } finally { setLoading(null) }
  }

  async function handleArchive() {
    setLoading("archive")
    try {
      const res = await fetch(`/api/thoughts/${thought.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !thought.isArchived }),
      })
      if (res.ok) {
        toast({ title: thought.isArchived ? "Publicação restaurada." : "Publicação arquivada." })
        onUpdate()
      }
    } finally { setLoading(null) }
  }

  // Common actions (Like, Repost, Save) - Reusing logic from previous version
  async function handleLike() {
    if (loading === "like") return
    setLoading("like"); const wasLiked = liked; setLiked(!wasLiked); setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)
    try {
      const res = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) { setLiked(wasLiked); setLikeCount(wasLiked ? likeCount : likeCount - 1) }
    } catch { setLiked(wasLiked); setLikeCount(wasLiked ? likeCount : likeCount - 1) }
    finally { setLoading(null) }
  }

  async function handleRepost() {
    if (loading === "repost") return
    setLoading("repost"); const wasRemixed = republished; setRepublished(!wasRemixed); setRepostCount(wasRemixed ? repostCount - 1 : repostCount + 1)
    try {
      const res = await fetch("/api/social/republish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (res.ok) toast({ title: wasRemixed ? "Remix removido" : "Remixado!" })
      else { setRepublished(wasRemixed); setRepostCount(wasRemixed ? repostCount : repostCount - 1) }
    } catch { setRepublished(wasRemixed) }
    finally { setLoading(null) }
  }

  async function handleSave() {
    if (loading === "save") return
    setLoading("save"); const wasSaved = saved; setSaved(!wasSaved); setSaveCount(wasSaved ? saveCount - 1 : saveCount + 1)
    try {
      const res = await fetch("/api/social/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (res.ok) toast({ title: wasSaved ? "Removido dos salvos" : "Salvo!" })
      else { setSaved(wasSaved); setSaveCount(wasSaved ? saveCount : saveCount - 1) }
    } catch { setSaved(wasSaved) }
    finally { setLoading(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between pt-1 -mx-1">
        <div className="flex items-center gap-0.5">
          <button onClick={handleLike} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${liked ? "text-rose-500" : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"}`}>
            <Heart size={18} strokeWidth={liked ? 0 : 2} fill={liked ? "currentColor" : "none"} className={liked ? "animate-like-pop" : "group-hover:scale-110 transition-transform"} />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${liked ? "text-rose-500" : "text-text-muted"}`}>{likeCount > 0 ? likeCount : ""}</span>
          </button>

          <button onClick={() => setShowComments(!showComments)} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${showComments ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand hover:bg-brand/10"}`}>
            <MessageCircle size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${showComments ? "text-brand" : "text-text-muted"}`}>{commentCount > 0 ? commentCount : ""}</span>
          </button>

          <button onClick={() => setRepostCount(!republished)} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${republished ? "text-emerald-500" : "text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"}`}>
            <Repeat2 size={18} strokeWidth={republished ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
            <span className={`text-xs tabular-nums font-medium min-w-[12px] ${republished ? "text-emerald-500" : "text-text-muted"}`}>{repostCount > 0 ? repostCount : ""}</span>
          </button>

          <button 
            onClick={() => setShowShareModal(true)} 
            className="group flex items-center gap-1.5 px-2 py-1.5 rounded-full text-text-muted hover:text-sky-400 hover:bg-sky-400/10 transition-all duration-200"
          >
            <Share2 size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${saved ? "text-brand" : "text-text-muted hover:text-brand hover:bg-brand/10"}`}>
            <Bookmark size={18} strokeWidth={saved ? 0 : 2} fill={saved ? "currentColor" : "none"} />
            {saveCount > 0 && <span className={`text-xs tabular-nums font-medium ${saved ? "text-brand" : "text-text-muted"}`}>{saveCount}</span>}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all duration-200"><MoreHorizontal size={18} /></button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[220px] bg-bg-surface border border-bg-border rounded-2xl shadow-2xl py-2 z-[200] animate-scale-in" sideOffset={8} align="end">
                {isOwner ? (
                  <>
                    <MenuItem icon={<Pencil size={16} />} onClick={() => setShowEditModal(true)}>Editar publicação</MenuItem>
                    <MenuItem icon={<Archive size={16} />} onClick={handleArchive}>{thought.isArchived ? "Restaurar do Arquivo" : "Arquivar publicação"}</MenuItem>
                    <MenuItem icon={<Trash2 size={16} />} onClick={handleDelete} danger>Excluir permanentemente</MenuItem>
                    <DropdownMenu.Separator className="h-px bg-bg-border my-1.5 mx-2" />
                  </>
                ) : null}
                <MenuItem icon={saved ? <Bookmark size={16} fill="currentColor"/> : <Bookmark size={16} />} onClick={handleSave}>{saved ? "Remover dos Salvos" : "Salvar publicação"}</MenuItem>
                <MenuItem icon={<Repeat2 size={16} />} onClick={handleRepost}>{republished ? "Remover Remix" : "Remix"}</MenuItem>
                <MenuItem icon={<Share2 size={16} />} onClick={() => setShowShareModal(true)}>Enviar via Chat</MenuItem>
                <MenuItem icon={<Link2 size={16} />} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/dashboard/feed?postId=${thought.id}`); toast({ title: "Link copiado!" }); }}>Copiar link</MenuItem>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-bg-border/30 pt-4 space-y-2 animate-fade-in">
          {commentsLoading ? (
            <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-brand" /></div>
          ) : (
            <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar pb-2 pt-2">
              {comments.filter(c => !c.parentCommentId).map((c: any) => (
                <CommentItem 
                  key={c.id} 
                  comment={c} 
                  isOwner={isOwner} 
                  onReply={setReplyTo}
                  onHeart={toggleCreatorHeart}
                  authorId={thought.userId}
                />
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="relative pt-2">
            {replyTo && (
              <div className="absolute -top-6 left-10 flex items-center gap-2 text-[10px] text-brand font-bold bg-brand/5 px-2 py-0.5 rounded-t-lg border-x border-t border-brand/20">
                <Reply size={10} />
                Respondendo a @{replyTo.user.name.split(" ")[0]}
                <button onClick={() => setReplyTo(null)} className="ml-1 hover:text-text-primary"><X size={10} /></button>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand to-brand-alt" />
              <div className="flex-1 flex items-center gap-2 bg-bg-overlay border border-bg-border rounded-full px-4 py-2.5 focus-within:border-brand/40 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                  placeholder={replyTo ? `Sua resposta...` : "Adicione um comentário..."}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                />
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowCommentRecorder(!showCommentRecorder)}
                    className={`p-2 rounded-full transition-colors ${showCommentRecorder ? "bg-brand/10 text-brand" : "text-text-muted hover:text-brand hover:bg-brand/10"}`}
                  >
                    <Mic size={16} />
                  </button>
                  <button onClick={submitComment} disabled={submitting || (!commentText.trim() && !commentAudioUrl)} className="text-brand hover:scale-110 active:scale-95 transition-all disabled:opacity-30">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showCommentRecorder && (
            <div className="mt-2 ml-12">
              <AudioRecorder 
                onRecordingComplete={handleAudioComment}
                onCancel={() => setShowCommentRecorder(false)}
              />
            </div>
          )}

          {commentAudioUrl && (
            <div className="mt-2 ml-12 flex items-center gap-2">
              <AudioPlayer src={commentAudioUrl} className="flex-1 scale-95 origin-left" />
              <button onClick={() => setCommentAudioUrl(null)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {showEditModal && <PostModal type={thought.type} editData={thought} onClose={() => { setShowEditModal(false); onUpdate(); }} />}
      {showShareModal && <ShareModal thoughtId={thought.id} onClose={() => setShowShareModal(false)} />}
    </div>
  )
}

function CommentItem({ comment, isOwner, onReply, onHeart, authorId }: any) {
  const ago = comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR }) : ""
  const isPostAuthor = comment.userId === authorId

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-bg-overlay">
          {comment.user?.image ? (
            <Image src={comment.user.image} alt="" width={32} height={32} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-brand">
              {comment.user?.name?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-text-primary hover:underline cursor-pointer">
              {comment.user?.name}
            </span>
            {isPostAuthor && (
              <span className="bg-brand/10 text-brand text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-brand/20 uppercase tracking-wider">
                Autor
              </span>
            )}
            <span className="text-text-muted text-[11px]">{ago}</span>
          </div>
          
          {comment.content && (
            <p className="text-[14px] text-text-secondary leading-normal mt-0.5">
              {comment.content}
            </p>
          )}
          
          {comment.mediaUrl && comment.mediaType === "audio" && (
            <AudioPlayer src={comment.mediaUrl} className="mt-2 scale-90 origin-left border-none bg-bg-overlay/50" />
          )}
          
          <div className="flex items-center gap-4 mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onReply(comment)} 
              className="text-[11px] font-bold text-text-muted hover:text-brand flex items-center gap-1"
            >
              <Reply size={12} /> Responder
            </button>

            {comment.likedByCreator && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">
                <Heart size={10} fill="currentColor" /> Curtido pelo criador
              </div>
            )}
            
            {isOwner && (
              <button 
                onClick={() => onHeart(comment.id, comment.likedByCreator)} 
                className={`text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  comment.likedByCreator ? "text-rose-500" : "text-text-muted hover:text-rose-400"
                }`}
              >
                <SmilePlus size={12} /> {comment.likedByCreator ? "Remover Coração" : "Coração do Criador"}
              </button>
            )}
          </div>

          {/* RECURSIVE REPLIES */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-4 border-l-2 border-bg-border/20 pl-4 py-1">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id}
                  comment={reply}
                  isOwner={isOwner}
                  onReply={onReply}
                  onHeart={onHeart}
                  authorId={authorId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ icon, children, onClick, danger }: any) {
  return (
    <DropdownMenu.Item onSelect={onClick} className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl mx-1.5 cursor-pointer outline-none transition-colors ${danger ? "text-red-400 hover:bg-red-500/10" : "text-text-primary hover:bg-bg-overlay"}`}>
      <span className={danger ? "text-red-400" : "text-text-muted"}>{icon}</span>
      {children}
    </DropdownMenu.Item>
  )
}
