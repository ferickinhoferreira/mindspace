"use client"
// components/layout/sidebar.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import {
  LayoutDashboard,
  Brain,
  Zap,
  Tags,
  FolderOpen,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/thoughts", label: "Pensamentos", icon: Brain },
  { href: "/dashboard/prompts", label: "Prompts", icon: Zap },
  { href: "/dashboard/tags", label: "Tags", icon: Tags },
  { href: "/dashboard/categories", label: "Categorias", icon: FolderOpen },
]

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-elevated border-r border-bg-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand text-sm">✦</span>
          </div>
          <div>
            <span className="font-display text-base text-text-primary leading-none block">MindSpace</span>
            <span className="text-text-muted text-xs">área de trabalho</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="label px-3 pt-2 pb-1.5">Menu</p>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-item group", active && "active")}
            >
              <item.icon size={16} className={active ? "text-brand" : "text-text-muted group-hover:text-text-secondary"} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="text-brand/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-bg-border space-y-1">
        <Link href="/dashboard/settings" className="sidebar-item">
          <Settings size={16} className="text-text-muted" />
          <span>Configurações</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-item w-full text-left text-red-400/70 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>

      {/* User */}
      <div className="p-3 border-t border-bg-border">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || ""}
              width={28}
              height={28}
              className="rounded-full ring-1 ring-bg-border"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/20 flex items-center justify-center">
              <span className="text-brand text-xs font-medium">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-medium truncate">{user.name || "Usuário"}</p>
            <p className="text-text-muted text-xs truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
