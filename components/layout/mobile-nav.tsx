"use client"
// components/layout/mobile-nav.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusSquare, Bell, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const items = [
    { href: "/dashboard/feed",    icon: Home,       label: "Home" },
    { href: "/dashboard/explore", icon: Search,     label: "Buscar" },
    { href: "/dashboard/create",  icon: PlusSquare, label: "Criar",  isSpecial: true },
    { href: "/dashboard/notifications", icon: Bell, label: "Notif." },
    { href: "/dashboard/profile", icon: UserIcon,   label: "Perfil" },
  ]

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-bg-border-subtle bg-black/95 backdrop-blur-2xl">
      <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
        {items.map((item) => {
          const active = isActive(item.href)

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-alt shadow-lg shadow-brand/30 active:scale-95 transition-transform"
              >
                <item.icon size={22} className="text-white" strokeWidth={2} />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-200",
                active ? "text-white" : "text-text-muted"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                active ? "bg-white/10" : "hover:bg-white/5"
              )}>
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className="transition-all duration-200"
                />
              </div>
              {/* Active dot */}
              {active && (
                <div className="absolute bottom-2 w-1 h-1 bg-brand rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
