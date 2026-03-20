"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, UserPlus, Users, Clock, Check, X, UserMinus } from "lucide-react"
import Image from "next/image"

export default function FriendsPage() {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [friendsRes, requestsRes] = await Promise.all([
      fetch("/api/friends?type=friends"),
      fetch("/api/friends?type=requests")
    ])
    const friendsData = await friendsRes.json()
    const requestsData = await requestsRes.json()
    setFriends(friendsData.friends || [])
    setRequests(requestsData.requests || [])
    setLoading(false)
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault()
    setActionLoading(true)
    setMessage({ type: "", text: "" })
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: "success", text: "Solicitação enviada!" })
      setEmail("")
    } else {
      setMessage({ type: "error", text: data.error })
    }
    setActionLoading(false)
  }

  async function handleRequest(id: string, status: string) {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    })
    loadData()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-brand" />
    </div>
  )

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-text-primary mb-1">Amigos</h1>
        <p className="text-text-muted text-sm">Conecte-se com outros usuários</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add Friend */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <UserPlus size={16} /> Adicionar Amigo
            </h3>
            <form onSubmit={sendRequest} className="space-y-3">
              <input
                type="email"
                className="input text-sm"
                placeholder="email@amigo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary w-full text-xs py-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Enviar Convite"}
              </button>
            </form>
            {message.text && (
              <p className={`mt-3 text-xs ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {message.text}
              </p>
            )}
          </div>

          {/* Pending Requests */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <Clock size={16} /> Solicitações Pendentes
            </h3>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-text-muted text-xs italic">Nenhuma solicitação</p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-overlay">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] text-brand uppercase">
                        {r.user.name?.[0] || r.user.email[0]}
                      </div>
                      <span className="text-xs text-text-primary truncate">{r.user.name || r.user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleRequest(r.id, "ACCEPTED")} className="p-1 hover:bg-green-500/20 text-green-400 rounded-md transition-colors">
                        <Check size={14} />
                      </button>
                      <button onClick={() => handleRequest(r.id, "BLOCKED")} className="p-1 hover:bg-red-500/20 text-red-400 rounded-md transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Friends List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 min-h-[400px]">
            <h3 className="text-sm font-medium text-text-primary mb-6 flex items-center gap-2">
              <Users size={16} /> Meus Amigos ({friends.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center opacity-60">
                   <Users size={32} className="text-text-muted mb-3" />
                   <p className="text-sm text-text-muted">Você ainda não tem amigos adicionados</p>
                </div>
              ) : (
                friends.map((f) => (
                  <div key={f.id} className="p-3 border border-bg-border rounded-xl flex items-center justify-between hover:bg-bg-overlay transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-sm text-brand uppercase font-medium">
                        {f.image ? (
                          <Image src={f.image} alt={f.name} width={36} height={36} className="rounded-full" />
                        ) : (
                          (f.name?.[0] || f.email[0])
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">{f.name || "Usuário"}</p>
                        <p className="text-[10px] text-text-muted truncate">{f.email}</p>
                      </div>
                    </div>
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-lg transition-all">
                      <UserMinus size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
