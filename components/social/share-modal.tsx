"use client"
// components/social/share-modal.tsx
import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Search, Send, Loader2, CheckCircle2 } from "lucide-react"

interface ShareModalProps {
  thoughtId: string
  onClose: () => void
}

export function ShareModal({ thoughtId, onClose }: ShareModalProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<string[]>([])

  useEffect(() => {
    loadFriends()
  }, [])

  async function loadFriends() {
    try {
      const res = await fetch("/api/social/friends") // Assuming this exists or using profile stats
      // If no dedicated friends API, we can use a followings list
      const res2 = await fetch("/api/profile")
      const data = await res2.json()
      // For demo, using followings as "friends" to share with
      setFriends(data.user.following.map((f: any) => f.following) || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleShare(friendId: string) {
    setSending(friendId)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipientId: friendId, 
          sharedThoughtId: thoughtId,
          content: "Confira esta publicação no MindSpace!" 
        })
      })
      if (res.ok) {
        setSent(prev => [...prev, friendId])
      }
    } finally {
      setSending(null)
    }
  }

  const filteredFriends = friends.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-bg-surface border border-bg-border rounded-3xl shadow-2xl z-[201] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-bg-border">
            <h2 className="text-lg font-bold text-text-primary">Compartilhar</h2>
            <button onClick={onClose} className="p-2 hover:bg-bg-overlay rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar amigos..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-overlay border border-bg-border rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-brand/40 transition-all font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand" size={24} /></div>
              ) : filteredFriends.length === 0 ? (
                <p className="text-center text-text-muted py-8 text-sm">Nenhum amigo encontrado.</p>
              ) : (
                filteredFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-overlay border border-bg-border">
                        {friend.image ? <img src={friend.image} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center font-bold text-brand bg-brand/10">{friend.name?.[0]}</div>}
                      </div>
                      <span className="font-bold text-sm text-text-primary">{friend.name}</span>
                    </div>
                    {sent.includes(friend.id) ? (
                      <span className="flex items-center gap-1.5 text-brand text-xs font-bold bg-brand/10 px-3 py-1.5 rounded-full animate-bounce-subtle">
                        <CheckCircle2 size={14} /> Enviado
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleShare(friend.id)}
                        disabled={!!sending}
                        className="bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-brand-dim active:scale-95 transition-all flex items-center gap-2"
                      >
                        {sending === friend.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Enviar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
