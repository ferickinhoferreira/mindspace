"use client"
// components/layout/mobile-nav.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Search, 
  PlusSquare, 
  Users, 
  User as UserIcon,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const items = [
    { href: "/dashboard/feed", icon: Home, label: "Home" },
    { href: "/dashboard/explore", icon: Search, label: "Explorar" },
    { href: "/dashboard/create", icon: PlusSquare, label: "Criar", isSpecial: true },
    { href: "/dashboard/friends", icon: Users, label: "Rede" },
    { href: "/dashboard/profile", icon: UserIcon, label: "Perfil" },
  ]

  function isActive(href: string) {
    return pathname === href
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-elevated/80 backdrop-blur-xl border-t border-bg-border z-50 px-4 pb-safe">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 group relative flex-1 min-w-0 h-full",
              isActive(item.href) ? "text-brand" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <div className={cn(
               "p-2 rounded-xl transition-all duration-300",
               isActive(item.href) && "bg-brand/10"
            )}>
              <item.icon 
                size={22} 
                strokeWidth={isActive(item.href) ? 2.5 : 2}
                className={cn("transition-transform duration-300", isActive(item.href) && "scale-110")} 
              />
            </div>
            {isActive(item.href) && (
              <div className="absolute top-1 right-1/4 w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
