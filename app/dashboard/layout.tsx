// app/dashboard/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { FABCreate } from "@/components/social/fab-create"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      <Sidebar user={session.user || {}} />
      <main className="flex-1 lg:ml-[72px] xl:ml-[280px] min-h-screen relative pb-20 lg:pb-0 transition-all duration-200">
        {children}
        <FABCreate />
      </main>
      <MobileNav />
    </div>
  )
}
