"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { useCartStore } from "@/stores/cart.store"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  status: string
  product_type: string
  image_url: string | null
  categories: { name: string; slug: string } | null
}

const typeLabel: Record<string, string> = {
  TOPUP: "Top Up",
  ACCOUNT: "Akun",
  VOUCHER: "Voucher",
}

const typeColor: Record<string, string> = {
  TOPUP: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACCOUNT: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  VOUCHER: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const user = useUser()
  const isAdmin = user?.role === "ADMIN"
  const isSold = product.status === "SOLD" || product.stock === 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isSold) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      product_type: product.product_type,
      max_stock: product.stock,
    })
    toast.success("Ditambahkan ke keranjang", { description: product.name })
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-violet-200/60 dark:border-white/5 bg-white dark:bg-white/3 shadow-sm shadow-violet-100 dark:shadow-none transition-all duration-300 hover:border-violet-400/60 dark:hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-200/80 dark:hover:shadow-lg dark:hover:shadow-violet-500/10">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-white/5">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-black/10 dark:text-white/10" />
            </div>
          )}
          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur">
                Terjual
              </span>
            </div>
          )}
          {/* Type badge */}
          <Badge
            className={`absolute left-2 top-2 text-[10px] border ${typeColor[product.product_type] ?? ""}`}
          >
            {typeLabel[product.product_type] ?? product.product_type}
          </Badge>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.categories && (
            <p className="mb-1 text-[10px] text-violet-500 dark:text-violet-400/70 uppercase tracking-wide">
              {product.categories.name}
            </p>
          )}
          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-slate-900 dark:text-white">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-slate-900 dark:text-white">{formatRupiah(product.price)}</p>
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isSold}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-600/30 dark:hover:bg-violet-600/40 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {product.product_type !== "TOPUP" && !isSold && (
            <p className="mt-1 text-[10px] text-black/30 dark:text-white/30">Stok: {product.stock}</p>
          )}
        </div>
      </div>
    </Link>
  )
}