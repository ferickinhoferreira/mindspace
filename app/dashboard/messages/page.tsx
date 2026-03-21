"use client"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { 
  Send, Search, MoreVertical, Phone, Video, 
  Image as ImageIcon, Smile, Paperclip, ArrowLeft,
  Mail, Loader2, User
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loadingConv, setLoadingConv] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id)
      // Polling for new messages
      const interval = setInterval(() => loadMessages(selectedConv.id, true), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConv])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadConversations() {
    try {
      const res = await fetch("/api/social/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } finally {
      setLoadingConv(false)
    }
  }

  async function loadMessages(convId: string, silent = false) {
    if (!silent) setLoadingMsg(true)
    try {
      const res = await fetch(`/api/social/messages?conversationId=${convId}`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } finally {
      if (!silent) setLoadingMsg(false)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending || !selectedConv) return
    setSending(true)
    try {
      const res = await fetch("/api/social/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          content: newMessage
        })
      })
      if (res.ok) {
        setNewMessage("")
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
      }
    } finally {
      setSending(false)
    }
  }

  const otherParticipant = (conv: any) => 
    conv.participants.find((p: any) => p.id !== session?.user?.id)

  return (
    <div className="flex h-[calc(100vh-64px)] bg-bg-base overflow-hidden">
      {/* Sidebar: Conv List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#1e1e1e] flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h1 className="text-xl font-black text-white tracking-tight">Mensagens</h1>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
            <Mail size={18} className="text-white" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2">
            <Search size={16} className="text-[#555]" />
            <input 
              type="text" 
              placeholder="Buscar conversas..." 
              className="bg-transparent text-sm text-white outline-none w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConv ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#7c6af7]" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-[#555] text-sm italic">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = otherParticipant(conv)
              const lastMsg = conv.messages[0]
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 p-4 transition-colors relative border-b border-[#1e1e1e]/30 ${
                    selectedConv?.id === conv.id ? 'bg-[#7c6af7]/10 border-l-4 border-l-[#7c6af7]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#111] shrink-0 border border-[#2a2a2a]">
                    {other?.image ? (
                      <Image src={other.image} alt="" width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#7c6af7] to-[#e040fb] flex items-center justify-center text-white font-bold">
                        {other?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-bold text-white truncate text-[15px]">{other?.name}</p>
                      {lastMsg && (
                        <span className="text-[10px] text-[#555] ml-2">
                          {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false, locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${selectedConv?.id === conv.id ? 'text-[#7c6af7]' : 'text-[#888]'}`}>
                      {lastMsg?.content || "Inicie uma conversa..."}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-bg-base relative ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#1e1e1e] bg-black/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full">
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2a2a2a]">
                  {otherParticipant(selectedConv)?.image ? (
                    <Image src={otherParticipant(selectedConv).image} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#111] flex items-center justify-center text-white font-bold">
                      {otherParticipant(selectedConv)?.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-white">{otherParticipant(selectedConv)?.name}</h2>
                  <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online agora
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-[#555] hover:text-[#7c6af7] transition-colors"><Phone size={18} /></button>
                <button className="p-2 text-[#555] hover:text-[#7c6af7] transition-colors"><Video size={18} /></button>
                <button className="p-2 text-[#555] hover:text-white transition-colors"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_center,_#000000_0%,_transparent_100%)]">
              {loadingMsg ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#7c6af7]" /></div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.senderId === session?.user?.id
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-lg ${
                        isMine 
                          ? 'bg-[#7c6af7] text-white rounded-br-none' 
                          : 'bg-[#111] text-[#ccc] border border-[#2a2a2a] rounded-bl-none'
                      }`}>
                        {m.content}
                        <p className={`text-[10px] mt-1 text-right opacity-50`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#1e1e1e] bg-black">
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <button className="p-2 text-[#555] hover:text-[#7c6af7] transition-colors hidden sm:block"><ImageIcon size={20} /></button>
                <button className="p-2 text-[#555] hover:text-[#7c6af7] transition-colors hidden sm:block"><Paperclip size={20} /></button>
                <div className="flex-1 flex items-center bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-2 group focus-within:border-[#7c6af7] transition-all">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 bg-transparent text-sm text-white outline-none py-1"
                  />
                  <button className="p-1 text-[#555] hover:text-yellow-500 transition-colors"><Smile size={20} /></button>
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-[#7c6af7] text-white rounded-2xl hover:bg-[#6b58e6] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(124,106,247,0.3)]"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,_#111_0%,_transparent_100%)]">
            <div className="w-20 h-20 rounded-3xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center text-3xl mb-4 shadow-xl">
              ✉️
            </div>
            <h3 className="text-xl font-black text-white mb-2">Selecione uma conversa</h3>
            <p className="text-[#555] text-sm max-w-xs">Escolha um amigo da lista ao lado para começar a conversar ou inicie uma nova através do perfil.</p>
            <Link href="/dashboard/explore" className="mt-6 px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-[#eee] transition-all active:scale-95">
              Encontrar pessoas
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
