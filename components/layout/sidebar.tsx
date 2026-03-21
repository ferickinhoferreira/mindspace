"use client"
// components/layout/sidebar.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User as UserIcon,
  Settings,
  LogOut,
  Brain,
  Zap,
  MoreHorizontal,
  PenSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard/feed",       label: "Início",        icon: Home,      exact: false },
  { href: "/dashboard/explore",    label: "Explorar",      icon: Search,    exact: false },
  { href: "/dashboard/messages",   label: "Mensagens",     icon: Mail,      exact: false },
  { href: "/dashboard/thoughts",   label: "Pensamentos",   icon: Brain,     exact: false },
  { href: "/dashboard/prompts",    label: "Prompts IA",    icon: Zap,       exact: false },
  { href: "/dashboard/bookmarks",  label: "Salvos",        icon: Bookmark,  exact: false },
  { href: "/dashboard/profile",    label: "Perfil",        icon: UserIcon,  exact: false },
]

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] xl:w-[280px] bg-bg-base border-r border-bg-border-subtle flex flex-col z-40 hidden lg:flex transition-all duration-200">
      {/* Logo */}
      <div className="p-4 xl:px-6 xl:py-5 mb-2">
        <Link href="/dashboard/feed" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand to-brand-alt flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
            M
          </div>
          <span className="hidden xl:block font-black text-xl text-text-primary tracking-tight">
            MindSpace
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 xl:px-3 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3.5 rounded-full transition-all duration-150 group",
                active
                  ? "font-bold text-text-primary"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary font-medium"
              )}
            >
              <item.icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={cn("flex-shrink-0", active ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary")}
              />
              <span className="hidden xl:block text-[17px]">{item.label}</span>
              {active && <div className="hidden xl:block ml-auto w-2 h-2 bg-brand rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Post Button */}
      <div className="px-3 mt-2 mb-4">
        <Link 
          href="/dashboard/feed"
          className="flex items-center justify-center xl:justify-start gap-3 bg-brand hover:bg-brand-dim text-white font-bold text-[15px] rounded-full h-12 w-12 xl:h-auto xl:w-full xl:px-6 xl:py-3.5 transition-all duration-200 active:scale-95 shadow-lg shadow-brand/20"
        >
          <PenSquare size={20} className="flex-shrink-0" />
          <span className="hidden xl:block">Publicar</span>
        </Link>
      </div>

      {/* User Footer */}
      <div className="p-2 xl:p-3 border-t border-bg-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-bg-surface transition-colors cursor-pointer group">
          <div className="flex-shrink-0">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || ""}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-bg-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-alt flex items-center justify-center text-white font-bold text-sm">
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="hidden xl:flex flex-1 flex-col min-w-0">
            <p className="text-text-primary text-sm font-bold truncate">{user?.name || "Usuário"}</p>
            <p className="text-text-muted text-xs truncate">@{(user?.name || user?.email || "user").replace(/\s/g, "").toLowerCase().slice(0, 15)}</p>
          </div>
          <MoreHorizontal size={18} className="hidden xl:block text-text-muted group-hover:text-text-primary flex-shrink-0 transition-colors" />
        </div>

        {/* Settings + Logout */}
        <div className="mt-1 space-y-0.5">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-full text-text-muted hover:bg-bg-surface hover:text-text-secondary transition-colors text-sm">
            <Settings size={16} />
            <span className="hidden xl:block">Configurações</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={16} />
            <span className="hidden xl:block">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
