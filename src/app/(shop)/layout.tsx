import { createClient } from "@/lib/supabase/server"
import { ShopHeader } from "@/components/shop/header"
import { UserProvider } from "@/contexts/user-context"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userInfo = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single()
    userInfo = { email: user.email, full_name: profile?.full_name, role: profile?.role }
  }

  return (
    <UserProvider user={userInfo}>
      <div className="min-h-screen" style={{ backgroundColor: "var(--brand-bg)" }}>
        <ShopHeader user={userInfo} />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <footer className="border-t border-black/5 dark:border-white/5 mt-16 py-8 text-center">
          <p className="text-xs text-black/25 dark:text-white/25">
            © 2026 Johen Gaming · Marketplace Akun & Top Up Game Terpercaya
          </p>
        </footer>
      </div>
    </UserProvider>
  )
}