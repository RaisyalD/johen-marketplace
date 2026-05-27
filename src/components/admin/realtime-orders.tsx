"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { ShoppingBag } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatRupiah } from "@/lib/utils"

export function RealtimeOrders() {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("admin-orders-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as {
            order_number: string
            customer_name: string
            total: number
            payment_method: string
          }
          toast(
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                <ShoppingBag className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pesanan Baru!</p>
                <p className="text-xs text-white/60">{order.customer_name}</p>
                <p className="text-xs font-medium text-violet-400 mt-0.5">
                  {order.order_number} · {formatRupiah(order.total)}
                </p>
              </div>
            </div>,
            {
              duration: 6000,
              style: {
                background: "#0d0d16",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#fff",
              },
            }
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return null
}