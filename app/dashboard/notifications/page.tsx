"use client"
import { Bell, Heart, MessageCircle, UserPlus, Repeat2 } from "lucide-react"

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "like",    user: "João",   text: "curtiu sua publicação",       time: "2m",  avatar: null },
  { id: 2, type: "follow",  user: "Maria",  text: "começou a seguir você",       time: "15m", avatar: null },
  { id: 3, type: "comment", user: "Pedro",  text: "comentou na sua publicação",  time: "1h",  avatar: null },
  { id: 4, type: "repost",  user: "Ana",    text: "republicou sua publicação",   time: "3h",  avatar: null },
  { id: 5, type: "like",    user: "Lucas",  text: "curtiu seu pensamento",       time: "5h",  avatar: null },
]

const ICON_MAP: Record<string, { icon: any; color: string }> = {
  like:    { icon: Heart,          color: "#f43f5e" },
  follow:  { icon: UserPlus,       color: "#7c6af7" },
  comment: { icon: MessageCircle,  color: "#38bdf8" },
  repost:  { icon: Repeat2,        color: "#22c55e" },
}

export default function NotificationsPage() {
  return (
    <div className="w-full min-h-screen animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-[#1e1e1e]">
        <div className="max-w-[600px] mx-auto px-4 py-4 flex items-center gap-3">
          <Bell size={20} className="text-[#7c6af7]" />
          <h1 className="text-[17px] font-bold text-white">Notificações</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center">
              <Bell size={28} className="text-[#555]" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-lg">Tudo tranquilo por aqui</h3>
              <p className="text-[#555] text-sm mt-1">Você não tem notificações novas.</p>
            </div>
          </div>
        ) : (
          MOCK_NOTIFICATIONS.map((n) => {
            const iconCfg = ICON_MAP[n.type] || ICON_MAP.like
            const Icon = iconCfg.icon
            return (
              <div
                key={n.id}
                className="flex items-center gap-4 px-4 py-4 border-b border-[#1e1e1e] hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                {/* Avatar with icon badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#e040fb] flex items-center justify-center text-white font-bold text-base">
                    {n.user[0]}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-black"
                    style={{ backgroundColor: iconCfg.color }}
                  >
                    <Icon size={10} strokeWidth={2.5} className="text-white" fill="white" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-white leading-snug">
                    <span className="font-bold">{n.user}</span>{" "}
                    <span className="text-[#a0a0a0]">{n.text}</span>
                  </p>
                  <p className="text-xs text-[#555] mt-0.5">{n.time} atrás</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
