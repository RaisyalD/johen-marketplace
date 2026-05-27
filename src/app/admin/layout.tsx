import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminMobileNav } from "@/components/admin/mobile-nav"
import { RealtimeOrders } from "@/components/admin/realtime-orders"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "ADMIN") redirect("/shop")

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Desktop sidebar */}
      <AdminSidebar userEmail={user.email} />
      {/* Main area: mobile nav on top, content below */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminMobileNav userEmail={user.email} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
      <RealtimeOrders />
    </div>
  )
}