"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import emailjs from "@emailjs/browser"
import { CheckCircle2, Package, ArrowRight, Home, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import type { ApiResponse } from "@/types/api.types"

type ProductInfo = { delivery_info: string | null; product_type: string } | null
type OrderItem = {
  id: string; product_name: string; price: number; quantity: number; subtotal: number
  products?: ProductInfo
}
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
  const emailSent = useRef(false)

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((json: ApiResponse<Order>) => {
        if (json.success) setOrder(json.data)
        else router.push("/shop")
      })
      .finally(() => setLoading(false))
  }, [orderNumber, router])

  useEffect(() => {
    if (!order || emailSent.current) return
    emailSent.current = true

    const itemsList = order.order_items
      .map((item) => `- ${item.product_name} ×${item.quantity}  →  ${formatRupiah(item.price * item.quantity)}`)
      .join("\n")

    const deliveryLines = order.order_items
      .map((item) => {
        const info = item.products?.delivery_info
        if (info) return `[ ${item.product_name} ]\n${info}`
        if (item.products?.product_type === "TOPUP")
          return `[ ${item.product_name} ]\nTop up sedang diproses dalam 1–5 menit. Pastikan User ID & server game kamu sudah benar.`
        return null
      })
      .filter(Boolean)
      .join("\n\n")

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          to_email: order.customer_email,
          customer_name: order.customer_name,
          order_number: order.order_number,
          items_list: itemsList,
          total: formatRupiah(order.total),
          payment_method: paymentLabel[order.payment_method] ?? order.payment_method,
          delivery_info: deliveryLines || "Detail produk akan dikonfirmasi oleh admin dalam 1×24 jam.",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(() => {
        toast.success("Email konfirmasi terkirim!", { description: order.customer_email })
      })
      .catch((err) => {
        console.error("[emailjs] error:", err)
        toast.error("Gagal kirim email: " + (err?.text ?? err?.message ?? JSON.stringify(err)))
      })
  }, [order])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
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
            <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pembayaran Berhasil!</h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">Pesananmu telah dikonfirmasi</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-300/50 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-3 py-1.5 text-xs text-violet-700 dark:text-violet-300">
          <Mail className="h-3.5 w-3.5" />
          Konfirmasi dikirim ke <span className="font-semibold">{order.customer_email}</span>
        </div>
      </div>

      {/* Order Card */}
      <div className="rounded-2xl border border-violet-200/60 dark:border-white/8 bg-white dark:bg-white/3 overflow-hidden">
        {/* Order Number Header */}
        <div className="border-b border-violet-200/60 dark:border-white/8 bg-violet-50/60 dark:bg-white/2 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-black/40 dark:text-white/40 uppercase tracking-wide">Nomor Pesanan</p>
              <p className="font-mono text-lg font-bold text-slate-900 dark:text-white mt-0.5">{order.order_number}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              PAID
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Item Pesanan</p>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-50 dark:bg-white/5">
                    <Package className="h-3.5 w-3.5 text-black/20 dark:text-white/30" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">×{item.quantity} · {formatRupiah(item.price)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-violet-200/40 dark:bg-white/5" />

        {/* Totals */}
        <div className="px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-black/50 dark:text-white/50">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Diskon {order.voucher_code && `(${order.voucher_code})`}</span>
              <span>-{formatRupiah(order.discount)}</span>
            </div>
          )}
          <Separator className="bg-violet-200/40 dark:bg-white/5" />
          <div className="flex justify-between font-bold text-base">
            <span className="text-slate-900 dark:text-white">Total</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
              {formatRupiah(order.total)}
            </span>
          </div>
        </div>

        <Separator className="bg-violet-200/40 dark:bg-white/5" />

        {/* Customer & Payment Info */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-black/30 dark:text-white/30 mb-0.5">Pembeli</p>
            <p className="text-slate-900 dark:text-white font-medium">{order.customer_name}</p>
            <p className="text-black/50 dark:text-white/50">{order.customer_email}</p>
          </div>
          <div>
            <p className="text-black/30 dark:text-white/30 mb-0.5">Metode Bayar</p>
            <p className="text-slate-900 dark:text-white font-medium">{paymentLabel[order.payment_method] ?? order.payment_method}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/shop"
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-violet-200/60 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-white/70 transition-colors hover:bg-violet-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
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