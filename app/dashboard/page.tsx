// app/dashboard/page.tsx
import { auth } from "@/auth"
import { DashboardHome } from "@/components/layout/dashboard-home"

export default async function DashboardPage() {
  const session = await auth()
  return <DashboardHome user={session!.user} />
}
