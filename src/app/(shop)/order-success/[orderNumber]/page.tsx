"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Package, ArrowRight, Home, Loader2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import type { ApiResponse } from "@/types/api.types"

type OrderItem = { id: string; product_name: string; price: number; quantity: number; subtotal: number }
type Order = {
  id: string; order_number: string; customer_name: string; customer_email: string
  subtotal: number; discount: number; total: number; status: string
  payment_method: string; voucher_code: string | null; created_at: string
  order_items: OrderItem[]
}

const paymentLabel: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
  QRIS: "QRIS",
}

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((json: ApiResponse<Order>) => {
        if (json.success) setOrder(json.data)
        else router.push("/shop")
      })
      .finally(() => setLoading(false))
  }, [orderNumber, router])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-lg mx-auto">
      {/* Success Animation */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">Pembayaran Berhasil!</h1>
        <p className="mt-1 text-sm text-white/50">Pesananmu telah dikonfirmasi</p>
      </div>

      {/* Order Card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
        {/* Order Number Header */}
        <div className="border-b border-white/8 bg-white/2 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide">Nomor Pesanan</p>
              <p className="font-mono text-lg font-bold text-white mt-0.5">{order.order_number}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
              PAID
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Item Pesanan</p>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5">
                    <Package className="h-3.5 w-3.5 text-white/30" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-white/40">×{item.quantity} · {formatRupiah(item.price)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-white shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Totals */}
        <div className="px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-white/50">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Diskon {order.voucher_code && `(${order.voucher_code})`}</span>
              <span>-{formatRupiah(order.discount)}</span>
            </div>
          )}
          <Separator className="bg-white/5" />
          <div className="flex justify-between font-bold text-base">
            <span className="text-white">Total</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
              {formatRupiah(order.total)}
            </span>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Customer & Payment Info */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-white/30 mb-0.5">Pembeli</p>
            <p className="text-white font-medium">{order.customer_name}</p>
            <p className="text-white/50">{order.customer_email}</p>
          </div>
          <div>
            <p className="text-white/30 mb-0.5">Metode Bayar</p>
            <p className="text-white font-medium">{paymentLabel[order.payment_method] ?? order.payment_method}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/shop"
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Belanja Lagi
        </Link>
        <Link
          href="/shop"
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-opacity hover:opacity-90"
        >
          Lihat Produk Lain
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}