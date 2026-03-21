"use client"
// app/dashboard/messages/page.tsx
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Plus, 
  Loader2, 
  ArrowLeft,
  Share2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msgInput, setMsgInput] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id)
  }, [activeConv])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function loadConversations() {
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      setConversations(data.conversations || [])
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(convId: string) {
    const res = await fetch(`/api/messages/${convId}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  async function sendMessage() {
    if (!msgInput.trim() || !activeConv || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, content: msgInput.trim() })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setMsgInput("")
        loadConversations() // update sidebar
      }
    } finally {
      setSending(false)
    }
  }

  const otherParticipant = (conv: any) => 
    conv.participants.find((p: any) => p.id !== session?.user?.id)

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black overflow-hidden animate-fade-in shadow-2xl">
      {/* ── Left Sidebar: Conversation List ── */}
      <div className={`w-full md:w-[380px] border-r border-bg-border flex flex-col ${activeConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-bg-border bg-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-text-primary">Mensagens</h1>
            <button className="p-2 hover:bg-bg-overlay rounded-full text-brand transition-colors"><Plus size={20} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar amigos..." 
              className="w-full bg-bg-overlay border border-bg-border rounded-full py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand/40 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand" size={24} /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-text-muted">Nenhuma conversa ainda.</div>
          ) : (
            conversations.map(conv => {
              const user = otherParticipant(conv)
              const lastMsg = conv.messages?.[0]
              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors border-l-2 ${activeConv?.id === conv.id ? "bg-brand/5 border-brand" : "border-transparent"}`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-bg-overlay border border-bg-border">
                    {user?.image ? <img src={user.image} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center font-bold text-brand bg-brand/10">{user?.name?.[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-sm text-text-primary truncate">{user?.name}</span>
                      <span className="text-[10px] text-text-muted">{lastMsg ? formatDistanceToNow(new Date(lastMsg.createdAt), { locale: ptBR }) : ""}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate">{lastMsg?.content || "Compartilhou uma publicação"}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-black overflow-hidden ${!activeConv ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-bg-border bg-black/50 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-1.5 hover:bg-bg-overlay rounded-full"><ArrowLeft size={20} /></button>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-overlay border border-bg-border">
                  {otherParticipant(activeConv)?.image ? <img src={otherParticipant(activeConv).image} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center font-bold text-brand">{otherParticipant(activeConv)?.name?.[0]}</div>}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-text-primary">{otherParticipant(activeConv)?.name}</h2>
                  <p className="text-[10px] text-brand font-bold animate-pulse">Online agora</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-brand">
                <button className="hover:scale-110 transition-transform"><Phone size={18} /></button>
                <button className="hover:scale-110 transition-transform"><Video size={20} /></button>
                <button className="hover:scale-110 transition-transform"><Info size={20} /></button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-chat-pattern">
              {messages.map((m: any) => {
                const isMine = m.senderId === session?.user?.id
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-slide-up`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine ? "bg-brand text-white rounded-br-none" : "bg-bg-surface border border-bg-border text-text-primary rounded-bl-none"}`}>
                      {m.sharedThought && (
                        <div className="mb-2 p-2 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-brand overflow-hidden">
                               {m.sharedThought.user.image && <img src={m.sharedThought.user.image} className="object-cover" />}
                            </div>
                            <span className="text-[10px] font-bold">@{m.sharedThought.user.name?.split(" ")[0]}</span>
                          </div>
                          <p className="text-[11px] line-clamp-2 opacity-80">{m.sharedThought.content}</p>
                          {m.sharedThought.mediaUrl && <div className="mt-1 rounded-lg overflow-hidden h-20"><img src={m.sharedThought.mediaUrl} className="w-full h-full object-cover" /></div>}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <span className="text-[9px] opacity-40 mt-1 block text-right">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-black border-t border-bg-border">
              <div className="flex items-center gap-3 bg-bg-surface border border-bg-border rounded-2xl px-4 py-2.5 focus-within:border-brand transition-all">
                <button className="text-text-muted hover:text-brand transition-colors"><Plus size={20} /></button>
                <input 
                  type="text" 
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage() }}
                  placeholder="Escreva uma mensagem..." 
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!msgInput.trim() || sending}
                  className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-bg-surface flex items-center justify-center text-4xl shadow-inner">💬</div>
            <div>
              <h2 className="text-lg font-bold text-text-primary italic">MindSpace Direct</h2>
              <p className="text-sm text-text-muted mt-1 max-w-[280px]">Envie mensagens, compartilhe ideias e remix com seus amigos em tempo real.</p>
            </div>
            <button className="bg-brand text-white text-xs font-bold px-6 py-2.5 rounded-full mt-2">Iniciar nova conversa</button>
          </div>
        )}
      </div>
    </div>
  )
}
