"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, LogOut, LayoutDashboard, Eye } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/stores/cart.store"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type UserInfo = {
  email?: string
  full_name?: string | null
  role?: string | null
} | null

export function ShopHeader({ user }: { user: UserInfo }) {
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.getCount())
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => { setMounted(true) }, [])

  async function handleLogout() {
    clearCart()
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Berhasil logout")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 backdrop-blur-xl" style={{ backgroundColor: "color-mix(in srgb, var(--brand-bg) 90%, transparent)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2">
            <Image src="/images/johen.jpeg" alt="Johen Gaming" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Johen<span className="text-violet-500 dark:text-violet-400">Gaming</span>
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Admin preview badge OR cart */}
            {user?.role === "ADMIN" ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400">
                <Eye className="h-3.5 w-3.5" />
                Mode Preview
              </div>
            ) : (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-black/50 dark:text-white/60 transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            )}

            <ThemeToggle />

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-black/50 dark:text-white/60 transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white outline-none"
                )}>
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-black/8 dark:border-white/10 text-slate-800 dark:text-white"
                  style={{ backgroundColor: "var(--brand-surface)" }}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                      {user.full_name ?? user.email}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="cursor-pointer text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 focus:bg-black/5 dark:focus:bg-white/5"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 focus:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 dark:bg-violet-600/20 px-3 py-1.5 text-sm font-medium text-white dark:text-violet-300 transition-colors hover:bg-violet-700 dark:hover:bg-violet-600/30"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
