"use client"
// components/social/thought-actions.tsx
import { useState, useEffect, useRef, useMemo } from "react"
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
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { PostModal } from "./post-modal"
import { ShareModal } from "./share-modal"
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
  
  const [loading, setLoading] = useState<string | null>(null)
  const [liked, setLiked] = useState((thought.likes?.length ?? 0) > 0)
  const [likeCount, setLikeCount] = useState(thought._count?.likes ?? 0)
  const [republished, setRepublished] = useState((thought.republishes?.length ?? 0) > 0)
  const [repostCount, setRepostCount] = useState(thought._count?.republishes ?? 0)
  const [saved, setSaved] = useState((thought.savedBy?.length ?? 0) > 0)
  const [saveCount, setSaveCount] = useState(thought._count?.savedBy ?? 0)
  const [commentCount, setCommentCount] = useState(thought._count?.comments ?? 0)

  const [showComments, setShowComments] = useState(false)
  const [flatComments, setFlatComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<any | null>(null)
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false) 
  const [showCommentRecorder, setShowCommentRecorder] = useState(false)
  const [commentAudioUrl, setCommentAudioUrl] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const isOwner = session?.user?.id === thought.userId

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
        setFlatComments(data.comments || [])
      }
    } finally {
      setCommentsLoading(false)
    }
  }

  // BUILD TREE FROM FLAT LIST
  const commentTree = useMemo(() => {
    const map: Record<string, any> = {}
    const roots: any[] = []
    
    flatComments.forEach(c => {
      map[c.id] = { ...c, replies: [] }
    })
    
    flatComments.forEach(c => {
      if (c.parentCommentId && map[c.parentCommentId]) {
        map[c.parentCommentId].replies.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })
    return roots
  }, [flatComments])

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
        setFlatComments(prev => prev.map(c => {
          if (c.id === commentId) return { ...c, likedByCreator: !currentStatus }
          return c
        }))
        toast({ title: !currentStatus ? "Coração do criador adicionado!" : "Coração removido." })
      }
    } catch {}
  }

  // --- ACTIONS ---
  async function handleLike() {
    if (loading === "like") return
    setLoading("like"); const wasLiked = liked; setLiked(!wasLiked); setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)
    const res = await fetch("/api/social/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thoughtId: thought.id }) })
    if (!res.ok) { setLiked(wasLiked); setLikeCount(wasLiked ? likeCount : likeCount - 1) }
    setLoading(null)
  }

  async function handleRepost() {
    if (loading === "repost") return
    setLoading("repost"); const wasRemixed = republished; setRepublished(!wasRemixed); setRepostCount(wasRemixed ? repostCount - 1 : repostCount + 1)
    const res = await fetch("/api/social/republish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thoughtId: thought.id }) })
    if (res.ok) toast({ title: wasRemixed ? "Remix removido" : "Remixado!" })
    else { setRepublished(wasRemixed); setRepostCount(wasRemixed ? repostCount : repostCount - 1) }
    setLoading(null)
  }

  async function handleSave() {
    if (loading === "save") return
    setLoading("save"); const wasSaved = saved; setSaved(!wasSaved); setSaveCount(wasSaved ? saveCount - 1 : saveCount + 1)
    const res = await fetch("/api/social/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thoughtId: thought.id }) })
    if (res.ok) toast({ title: wasSaved ? "Removido dos salvos" : "Salvo!" })
    else { setSaved(wasSaved); setSaveCount(wasSaved ? saveCount : saveCount - 1) }
    setLoading(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between pt-1 -mx-1">
        <div className="flex items-center gap-0.5">
          <button onClick={handleLike} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${liked ? "text-rose-500" : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"}`}>
            <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} className={liked ? "animate-like-pop" : "group-hover:scale-110 transition-transform"} />
            <span className="text-xs font-medium">{likeCount > 0 ? likeCount : ""}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${showComments ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand hover:bg-brand/10"}`}>
            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">{commentCount > 0 ? commentCount : ""}</span>
          </button>
          <button onClick={handleRepost} className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${republished ? "text-emerald-500 bg-emerald-500/10" : "text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"}`}>
            <Repeat2 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">{repostCount > 0 ? repostCount : ""}</span>
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-1.5 rounded-full text-text-muted hover:text-sky-400 hover:bg-sky-400/10 transition-all"><Share2 size={16} /></button>
        </div>

        <button onClick={handleSave} className={`p-1.5 rounded-full transition-all ${saved ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand hover:bg-brand/10"}`}>
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} strokeWidth={saved ? 0 : 2} />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-bg-border/30 pt-4 space-y-4 animate-fade-in">
          {commentsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-brand" size={20} /></div>
          ) : (
            <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar py-2">
              {commentTree.map((c: any) => (
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
                  className="flex-1 bg-transparent text-sm text-text-primary outline-none"
                />
                <button onClick={() => setShowCommentRecorder(!showCommentRecorder)} className={`p-2 rounded-full ${showCommentRecorder ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand"}`}><Mic size={16} /></button>
                <button onClick={submitComment} disabled={submitting || (!commentText.trim() && !commentAudioUrl)} className="text-brand disabled:opacity-30">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>

          {showCommentRecorder && <div className="mt-2 ml-10"><AudioRecorder onRecordingComplete={handleAudioComment} onCancel={() => setShowCommentRecorder(false)} /></div>}
          {commentAudioUrl && (
            <div className="mt-2 ml-10 flex items-center gap-2">
              <AudioPlayer src={commentAudioUrl} className="flex-1 scale-95 origin-left" />
              <button onClick={() => setCommentAudioUrl(null)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-bg-border">
          {comment.user?.image ? <Image src={comment.user.image} alt="" width={32} height={32} className="object-cover" /> : <div className="w-full h-full bg-brand flex items-center justify-center text-[10px] text-white font-bold">{comment.user?.name?.[0]}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-primary">{comment.user?.name}</span>
            {isPostAuthor && <span className="bg-brand/10 text-brand text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-brand/20 uppercase">Autor</span>}
            <span className="text-text-muted text-[11px]">{ago}</span>
          </div>
          {comment.content && <p className="text-[14px] text-text-secondary leading-normal mt-0.5">{comment.content}</p>}
          {comment.mediaUrl && comment.mediaType === "audio" && <AudioPlayer src={comment.mediaUrl} className="mt-2 scale-90 origin-left border-none bg-bg-overlay/50" />}
          
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => onReply(comment)} className="text-[11px] font-bold text-text-muted hover:text-brand flex items-center gap-1"><Reply size={12} /> Responder</button>
            {comment.likedByCreator && <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500"><Heart size={10} fill="currentColor" /> Curtido pelo criador</div>}
            {isOwner && (
              <button 
                onClick={() => onHeart(comment.id, comment.likedByCreator)} 
                className={`text-[11px] font-bold flex items-center gap-1 ${comment.likedByCreator ? "text-rose-500" : "text-text-muted hover:text-rose-400"}`}
              >
                <SmilePlus size={12} /> {comment.likedByCreator ? "Remover Coração" : "Coração do Criador"}
              </button>
            )}
          </div>

          {/* RECURSIVE REPLIES */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-bg-border/20 pl-4">
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
