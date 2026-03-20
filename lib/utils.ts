// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  })
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy", { locale: ptBR })
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export const THOUGHT_TYPES = [
  { value: "NOTE", label: "Nota", icon: "📝", color: "#64748b" },
  { value: "IDEA", label: "Ideia", icon: "💡", color: "#f59e0b" },
  { value: "PLAN", label: "Plano", icon: "🗺️", color: "#3b82f6" },
  { value: "POEM", label: "Poema", icon: "🌸", color: "#ec4899" },
  { value: "TEXT", label: "Texto", icon: "✍️", color: "#10b981" },
  { value: "JOURNAL", label: "Diário", icon: "📔", color: "#8b5cf6" },
] as const

export const PROMPT_MODELS = [
  "ChatGPT / GPT-4",
  "Claude",
  "Gemini",
  "Midjourney",
  "Stable Diffusion",
  "DALL-E",
  "Suno",
  "Runway",
  "Universal",
]

export const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#d946ef", "#ec4899", "#64748b",
]
