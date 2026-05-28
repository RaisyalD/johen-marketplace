"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, ShoppingCart, Zap } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { useCartStore } from "@/stores/cart.store"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiResponse } from "@/types/api.types"

type Product = {
  id: string; name: string; description: string | null; price: number
  stock: number; status: string; product_type: string
  image_url: string | null; categories: { name: string; slug: string } | null
}

const typeLabel: Record<string, string> = { TOPUP: "Top Up", ACCOUNT: "Akun", VOUCHER: "Voucher" }
const typeColor: Record<string, string> = {
  TOPUP: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACCOUNT: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  VOUCHER: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const user = useUser()
  const isAdmin = user?.role === "ADMIN"

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((json: ApiResponse<Product>) => {
        if (json.success) setProduct(json.data)
        else router.push("/shop")
      })
      .finally(() => setLoading(false))
  }, [id, router])

  function handleAddToCart() {
    if (!product || product.status === "SOLD" || product.stock === 0) return
    addItem({
      id: product.id, name: product.name, price: product.price,
      image_url: product.image_url, product_type: product.product_type,
      max_stock: product.stock,
    })
    toast.success("Ditambahkan ke keranjang", { description: product.name })
  }

  function handleBuyNow() {
    handleAddToCart()
    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-4 w-24 bg-white/5 mb-6" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl bg-white/5" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4 bg-white/5" />
            <Skeleton className="h-8 w-1/2 bg-white/5" />
            <Skeleton className="h-20 w-full bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const isSold = product.status === "SOLD" || product.stock === 0

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-black/40 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Toko
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-violet-200/60 dark:border-white/5 bg-slate-100 dark:bg-white/5">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-20 w-20 text-white/10" />
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur">
                Terjual Habis
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <Badge className={`text-xs border ${typeColor[product.product_type] ?? ""}`}>
              {typeLabel[product.product_type] ?? product.product_type}
            </Badge>
            {product.categories && (
              <span className="text-xs text-white/40">{product.categories.name}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{product.name}</h1>

          <p className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400 mb-4">
            {formatRupiah(product.price)}
          </p>

          {product.description && (
            <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed mb-6">{product.description}</p>
          )}

          {!isSold && product.product_type !== "TOPUP" && (
            <p className="mb-4 text-xs text-black/30 dark:text-white/30">Stok tersedia: {product.stock}</p>
          )}

          <div className="mt-auto space-y-3">
            {isAdmin ? (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-center text-sm text-violet-400/70">
                Mode preview — admin tidak dapat melakukan transaksi
              </div>
            ) : (
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={isSold}
                  className="w-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 disabled:opacity-40"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isSold ? "Stok Habis" : "Tambah ke Keranjang"}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isSold}
                  className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20 disabled:opacity-40"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Beli Sekarang
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}