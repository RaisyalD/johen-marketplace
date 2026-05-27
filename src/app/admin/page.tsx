"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingCart, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRupiah } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

type RevenueDay = { date: string; revenue: number }
type Stats = {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  revenueByDay: RevenueDay[]
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-xs">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="text-violet-400 font-semibold">{formatRupiah(payload[0].value)}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data) })
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      title: "Total Produk",
      value: stats?.totalProducts ?? 0,
      format: (v: number) => v.toString(),
      icon: Package,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Total Pesanan",
      value: stats?.totalOrders ?? 0,
      format: (v: number) => v.toString(),
      icon: ShoppingCart,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      format: (v: number) => formatRupiah(v),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Ringkasan aktivitas Johen Gaming</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24 bg-white/8" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-white/8" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-32 bg-white/8" />
                </CardContent>
              </Card>
            ))
          : cards.map((card) => (
              <Card key={card.title} className="border-white/5 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">{card.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{card.format(card.value)}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Revenue chart */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-white/60">Revenue 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.revenueByDay ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
