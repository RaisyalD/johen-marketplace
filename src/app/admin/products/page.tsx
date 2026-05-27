"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ProductTable } from "@/components/admin/product-table"
import { ProductForm } from "@/components/admin/product-form"
import type { ApiResponse } from "@/types/api.types"

type Product = {
  id: string; name: string; description: string | null; price: number
  stock: number; status: string; product_type: string; image_url: string | null
  category_id: string | null; categories: { id: string; name: string; slug: string } | null
}

type ProductsData = { products: Product[]; total: number; totalPages: number }

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "15", sort: "newest" })
    if (search) params.set("search", search)
    if (typeFilter !== "ALL") params.set("type", typeFilter)
    if (statusFilter !== "ALL") params.set("status", statusFilter)

    try {
      const res = await fetch(`/api/products?${params}`)
      const json: ApiResponse<ProductsData> = await res.json()
      if (json.success) setData(json.data)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter])

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [fetchProducts])

  function handleEdit(product: Product) {
    setEditProduct(product)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditProduct(null)
    setFormOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Produk</h1>
          <p className="text-white/50 text-sm mt-1">
            {data ? `${data.total} produk ditemukan` : "Memuat..."}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v ?? "ALL"); setPage(1) }}>
          <SelectTrigger className="w-36 border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#1a1a2e] text-white">
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="TOPUP">Top Up</SelectItem>
            <SelectItem value="ACCOUNT">Akun</SelectItem>
            <SelectItem value="VOUCHER">Voucher</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1) }}>
          <SelectTrigger className="w-36 border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#1a1a2e] text-white">
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0">
              <Skeleton className="h-10 w-10 rounded-lg bg-white/8 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40 bg-white/8" />
                <Skeleton className="h-3 w-24 bg-white/5" />
              </div>
              <Skeleton className="h-3.5 w-20 bg-white/8" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/8" />
              <Skeleton className="h-7 w-16 rounded-lg bg-white/8" />
            </div>
          ))}
        </div>
      ) : (
        <ProductTable
          products={(data?.products ?? []).map((p) => ({ ...p, categories: p.categories ?? null }))}
          onEdit={(p) => handleEdit(p as Product)}
          onDelete={fetchProducts}
        />
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-white/40">
            Halaman {page} dari {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        onSuccess={fetchProducts}
        product={editProduct as Parameters<typeof ProductForm>[0]["product"]}
      />
    </div>
  )
}