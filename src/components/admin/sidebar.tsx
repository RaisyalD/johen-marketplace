"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCartStore } from "@/stores/cart.store"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produk", icon: Package, exact: false },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart, exact: false },
]

export function AdminSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)

  async function handleLogout() {
    clearCart()
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Berhasil logout")
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r border-white/5 bg-[#0d0d14]">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-white/5 px-6 py-5">
        <Image src="/images/johen.jpeg" alt="Johen Gaming" width={32} height={32} className="rounded-lg" />
        <div>
          <p className="text-sm font-bold text-white">Johen Gaming</p>
          <p className="text-xs text-violet-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-violet-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-3 py-4 space-y-1">
        <Link
          href="/shop"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <Store className="h-3.5 w-3.5" />
          Lihat Toko
        </Link>
        <div className="px-3 py-2">
          <p className="text-xs text-white/30 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}