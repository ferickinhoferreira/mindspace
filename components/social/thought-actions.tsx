"use client"
// components/social/thought-actions.tsx
import { useState } from "react"
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
  Trash2,
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
  const isFollowing = (thought.user.followers || []).length > 0

  async function handleLike() {
    if (loading === "like") return
    setLoading("like")

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)

    try {
      const res = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) {
        setLiked(wasLiked)
        setLikeCount(wasLiked ? likeCount : likeCount - 1)
      }
    } catch {
      setLiked(wasLiked)
      setLikeCount(wasLiked ? likeCount : likeCount - 1)
    } finally {
      setLoading(null)
    }
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
      if (!res.ok) {
        setRepublished(wasReposted)
        setRepostCount(wasReposted ? repostCount : repostCount - 1)
      } else {
        toast({
          title: wasReposted ? "Republicação removida" : "Republicado!",
          description: wasReposted ? "" : "A postagem foi adicionada ao seu perfil.",
        })
      }
    } catch {
      setRepublished(wasReposted)
    } finally {
      setLoading(null)
    }
  }

  async function handleSave() {
    if (loading === "save") return
    setLoading("save")
    const wasSaved = saved
    setSaved(!wasSaved)

    try {
      const res = await fetch("/api/social/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thoughtId: thought.id }),
      })
      if (!res.ok) {
        setSaved(wasSaved)
      } else {
        toast({
          title: wasSaved ? "Removido dos salvos" : "Salvo!",
          description: wasSaved ? "" : "A postagem foi salva no seu perfil.",
        })
      }
    } catch {
      setSaved(wasSaved)
    } finally {
      setLoading(null)
    }
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
    } finally {
      setLoading(null)
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." })
    }
  }

  const commentCount = thought._count?.comments ?? 0

  return (
    <div className="flex items-center justify-between pt-1 -mx-1">
      {/* Left actions */}
      <div className="flex items-center gap-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
            liked
              ? "text-rose-500"
              : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"
          }`}
        >
          <Heart
            size={18}
            strokeWidth={liked ? 0 : 2}
            fill={liked ? "currentColor" : "none"}
            className={liked ? "animate-like-pop" : "group-hover:scale-110 transition-transform"}
          />
          <span className={`text-xs tabular-nums font-medium ${liked ? "text-rose-500" : "text-text-muted"}`}>
            {likeCount > 0 ? likeCount : ""}
          </span>
        </button>

        {/* Comment */}
        <button className="group flex items-center gap-1.5 px-2 py-1.5 rounded-full text-text-muted hover:text-brand hover:bg-brand/10 transition-all duration-200">
          <MessageCircle size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs tabular-nums font-medium">
            {commentCount > 0 ? commentCount : ""}
          </span>
        </button>

        {/* Repost */}
        <button
          onClick={handleRepost}
          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200 ${
            republished
              ? "text-emerald-500"
              : "text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"
          }`}
        >
          <Repeat2
            size={18}
            strokeWidth={republished ? 2.5 : 2}
            className="group-hover:scale-110 transition-transform"
          />
          <span className={`text-xs tabular-nums font-medium ${republished ? "text-emerald-500" : "text-text-muted"}`}>
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
        <button
          onClick={handleSave}
          className={`px-2 py-1.5 rounded-full transition-all duration-200 ${
            saved
              ? "text-brand"
              : "text-text-muted hover:text-brand hover:bg-brand/10"
          }`}
        >
          <Bookmark size={18} strokeWidth={saved ? 0 : 2} fill={saved ? "currentColor" : "none"} />
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
                {republished ? "Remover republicação" : "Republicar"}
              </MenuItem>
              <MenuItem icon={<Star size={16} />}>Adicionar aos Favoritos</MenuItem>
              <MenuItem icon={<Link2 size={16} />} onClick={handleShare}>Copiar link</MenuItem>

              <DropdownMenu.Separator className="h-px bg-bg-border my-1.5 mx-2" />

              <MenuItem icon={isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />} onClick={handleFollow}>
                {isFollowing ? `Deixar de seguir @${thought.user.name?.split(" ")[0]}` : `Seguir @${thought.user.name?.split(" ")[0]}`}
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
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-text-primary hover:bg-bg-overlay"
      }`}
    >
      <span className={danger ? "text-red-400" : "text-text-muted"}>{icon}</span>
      {children}
    </DropdownMenu.Item>
  )
}
