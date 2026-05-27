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

export function AdminMobileNav({ userEmail }: { userEmail?: string }) {
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
    <header className="md:hidden flex flex-col border-b border-white/5 bg-[#0d0d14]">
      {/* Top bar: logo + email + logout */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Image src="/images/johen.jpeg" alt="Johen Gaming" width={28} height={28} className="rounded-lg" />
          <div>
            <p className="text-xs font-bold text-white leading-none">Johen Gaming</p>
            <p className="text-[10px] text-violet-400">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-white/30 max-w-[120px] truncate hidden sm:block">{userEmail}</p>
          <Link
            href="/shop"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white/70 transition-colors"
            title="Lihat Toko"
          >
            <Store className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Bottom: nav tabs */}
      <nav className="flex">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-violet-300 border-b-2 border-violet-400" : "text-white/40 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-violet-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}