"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cart.store"
import { formatRupiah } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-sm flex-col border-black/8 dark:border-white/10 text-slate-900 dark:text-white"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <SheetHeader>
          <SheetTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-violet-400" />
            Keranjang ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <ShoppingCart className="h-12 w-12 text-black/15 dark:text-white/10" />
            <p className="text-black/40 dark:text-white/40 text-sm">Keranjang kamu kosong</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 px-4 py-2 text-sm font-medium text-black/60 dark:text-white/70 transition-colors hover:border-violet-400/40 dark:hover:border-white/25 hover:bg-violet-50 dark:hover:bg-white/10 hover:text-violet-700 dark:hover:text-white"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-black/20 dark:text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-violet-600 dark:text-violet-400">{formatRupiah(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 text-black/50 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm text-slate-900 dark:text-white w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_stock}
                        className="flex h-6 w-6 items-center justify-center rounded border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 text-black/50 dark:text-white/60 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start text-black/25 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-black/50 dark:text-white/60">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(getTotal())}</span>
              </div>
              <Separator className="bg-black/5 dark:bg-white/5" />
              <Link
                href="/checkout"
                onClick={onClose}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20 justify-center"
                )}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}