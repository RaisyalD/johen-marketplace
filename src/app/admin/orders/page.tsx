"use client"

import { useCallback, useEffect, useState } from "react"
import { ShoppingBag, Eye, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { ApiResponse } from "@/types/api.types"

type Order = {
  id: string; order_number: string; customer_name: string; customer_email: string
  total: number; status: string; payment_method: string; created_at: string
}
type OrderDetail = Order & {
  subtotal: number; discount: number; voucher_code: string | null; customer_phone: string | null
  order_items: { id: string; product_name: string; price: number; quantity: number; subtotal: number }[]
}

type OrdersData = { orders: Order[]; total: number; totalPages: number; page: number }

const STATUS_OPTIONS = ["PENDING", "PAID", "COMPLETED", "FAILED", "CANCELLED"] as const

const statusStyle: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  COMPLETED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
  CANCELLED: "bg-white/10 text-white/40 border-white/15",
}

const paymentLabel: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
  QRIS: "QRIS",
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso))
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" })
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const res = await fetch(`/api/orders?${params}`)
      const json: ApiResponse<OrdersData> = await res.json()
      if (json.success) setData(json.data)
      else toast.error("Gagal memuat pesanan")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function openDetail(orderNumber: string) {
    setLoadingDetail(true)
    setDetailOpen(true)
    try {
      const res = await fetch(`/api/orders/${orderNumber}`)
      const json: ApiResponse<OrderDetail> = await res.json()
      if (json.success) setDetail(json.data)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleStatusChange(orderNumber: string, newStatus: string | null) {
    if (!newStatus) return
    setUpdatingStatus(orderNumber)
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Status diubah ke ${newStatus}`)
        setData((prev) =>
          prev
            ? { ...prev, orders: prev.orders.map((o) => o.order_number === orderNumber ? { ...o, status: newStatus } : o) }
            : prev
        )
        if (detail?.order_number === orderNumber) setDetail((d) => d ? { ...d, status: newStatus } : d)
      } else {
        toast.error("Gagal mengubah status")
      }
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Pesanan</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {data ? `${data.total} total pesanan` : "Memuat..."}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1) }}>
            <SelectTrigger className="w-48 h-9 border-white/10 bg-white/5 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#15151f] text-white">
              <SelectItem value="ALL">Semua Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : !data?.orders.length ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2">
              <ShoppingBag className="h-10 w-10 text-white/10" />
              <p className="text-sm text-white/30">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">No. Pesanan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">Pembeli</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">Metode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/30">Tanggal</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white/30">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-violet-400">{order.order_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium truncate max-w-35">{order.customer_name}</p>
                        <p className="text-white/40 text-xs truncate max-w-35">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{formatRupiah(order.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {updatingStatus === order.order_number ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                          ) : null}
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleStatusChange(order.order_number, v)}
                            disabled={updatingStatus === order.order_number}
                          >
                            <SelectTrigger className={`h-7 w-32 border text-[11px] font-medium px-2 ${statusStyle[order.status] ?? ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#15151f] text-white text-xs">
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">
                        {paymentLabel[order.payment_method] ?? order.payment_method}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetail(order.order_number)}
                          className="h-7 px-2 text-white/50 hover:text-white hover:bg-white/5"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >Sebelumnya</button>
            <span className="text-sm text-white/40">{page} / {data.totalPages}</span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >Berikutnya</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0d0d16] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Detail Pesanan</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : detail ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-violet-400">{detail.order_number}</span>
                <div className="flex items-center gap-2">
                  {updatingStatus === detail.order_number && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                  )}
                  <Select
                    value={detail.status}
                    onValueChange={(v) => handleStatusChange(detail.order_number, v)}
                    disabled={updatingStatus === detail.order_number}
                  >
                    <SelectTrigger className={`h-7 w-36 border text-[11px] font-medium px-2 ${statusStyle[detail.status] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#15151f] text-white text-xs">
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="bg-white/8" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-white/30 mb-0.5">Pembeli</p>
                  <p className="text-white">{detail.customer_name}</p>
                  <p className="text-white/50">{detail.customer_email}</p>
                  {detail.customer_phone && <p className="text-white/50">{detail.customer_phone}</p>}
                </div>
                <div>
                  <p className="text-white/30 mb-0.5">Pembayaran</p>
                  <p className="text-white">{paymentLabel[detail.payment_method] ?? detail.payment_method}</p>
                  <p className="text-white/40 mt-0.5">{formatDate(detail.created_at)}</p>
                </div>
              </div>
              <Separator className="bg-white/8" />
              <div className="space-y-2">
                {detail.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-white">{item.product_name}</p>
                      <p className="text-white/40 text-xs">×{item.quantity} · {formatRupiah(item.price)}</p>
                    </div>
                    <p className="text-white font-medium">{formatRupiah(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/8" />
              <div className="space-y-1.5">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span><span>{formatRupiah(detail.subtotal)}</span>
                </div>
                {detail.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon {detail.voucher_code && `(${detail.voucher_code})`}</span>
                    <span>-{formatRupiah(detail.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                    {formatRupiah(detail.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}