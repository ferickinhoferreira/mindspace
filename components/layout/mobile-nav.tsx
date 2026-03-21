"use client"
// components/layout/mobile-nav.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, Bell, User as UserIcon, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const items = [
    { href: "/dashboard/feed",    icon: Home,       label: "Início" },
    { href: "/dashboard/explore", icon: Search,     label: "Procurar" },
    { href: "CREATE",             icon: Plus,       label: "Criar",  isSpecial: true },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Mensagens" },
    { href: "/dashboard/profile", icon: UserIcon,   label: "Perfil" },
  ]

  function isActive(href: string) {
    return pathname === href || (href !== "CREATE" && pathname.startsWith(href + "/"))
  }

  function handleCreate() {
    window.dispatchEvent(new CustomEvent("open-create-sheet"))
  }

  return (
    <nav className="lg:hidden fixed bottom-row inset-x-0 z-50 border-t border-bg-border/20 bg-black/90 backdrop-blur-2xl">
      <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
        {items.map((item) => {
          const active = isActive(item.href)

          if (item.isSpecial) {
            return (
              <button
                key={item.href}
                onClick={handleCreate}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-alt shadow-lg shadow-brand/40 active:scale-90 transition-all border border-white/10"
              >
                <item.icon size={26} className="text-white" strokeWidth={3} />
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-200",
                active ? "text-brand" : "text-text-muted"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                active ? "bg-brand/10 text-brand" : "hover:bg-white/5"
              )}>
                <item.icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
