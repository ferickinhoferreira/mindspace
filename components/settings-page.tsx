"use client"
// components/settings-page.tsx
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Settings, LogOut, Trash2, Shield, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SettingsPage() {
  const { toast } = useToast()

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} className="text-brand" />
          <h1 className="font-display text-2xl text-text-primary">Configurações</h1>
        </div>
        <p className="text-text-muted text-sm">Gerencie sua conta e preferências</p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={15} className="text-text-muted" />
            <h2 className="text-text-primary font-medium text-sm">Conta</h2>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </div>

        {/* About */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} className="text-text-muted" />
            <h2 className="text-text-primary font-medium text-sm">Sobre o MindSpace</h2>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">
            MindSpace é sua área de trabalho pessoal para capturar pensamentos, ideias, textos e prompts. 
            Tudo organizado, tudo seu.
          </p>
          <div className="mt-3 flex gap-4 text-xs text-text-muted">
            <span>Versão 1.0.0</span>
            <span>Next.js + Prisma + Vercel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
