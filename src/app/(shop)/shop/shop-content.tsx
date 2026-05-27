"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Zap, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProductGrid } from "@/components/shop/product-grid"
import { CategoryFilter } from "@/components/shop/category-filter"

import type { ApiResponse } from "@/types/api.types"

type Product = {
  id: string; name: string; price: number; stock: number
  status: string; product_type: string; image_url: string | null
  categories: { name: string; slug: string } | null
}

type ProductsData = { products: Product[]; total: number; totalPages: number; page: number }
type Category = { id: string; name: string; slug: string }

export function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ProductsData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "")

  const search = searchParams.get("search") ?? ""
  const category = searchParams.get("category") ?? ""
  const type = searchParams.get("type") ?? ""
  const page = Number(searchParams.get("page") ?? "1")

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data) })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    const params = new URLSearchParams({ page: String(page), limit: "12", sort: "newest" })
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (type) params.set("type", type)
    try {
      const res = await fetch(`/api/products?${params}`)
      const json: ApiResponse<ProductsData> = await res.json()
      if (json.success) setData(json.data)
      else setFetchError(true)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [search, category, type, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchInput) params.set("search", searchInput)
      else params.delete("search")
      params.delete("page")
      router.push(`/shop?${params.toString()}`)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-700 dark:text-violet-300">
          <Zap className="h-3 w-3" />
          Top Up & Jual Beli Akun Game Terpercaya
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          Temukan{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
            Item Gaming
          </span>{" "}
          Impianmu
        </h1>
        <p className="mt-2 text-sm text-black/40 dark:text-white/40">
          {data ? `${data.total} produk tersedia` : "Memuat produk..."}
        </p>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30 dark:text-white/30" />
        <Input
          placeholder="Cari akun, top up, voucher..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 h-11 border-violet-200/70 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus-visible:ring-violet-500 focus-visible:border-violet-400"
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CategoryFilter categories={categories} />
      </div>

      {/* Grid */}
      {fetchError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-16 text-center">
          <p className="text-sm text-red-400 mb-3">Gagal memuat produk. Periksa koneksi kamu.</p>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Lagi
          </button>
        </div>
      ) : (
        <ProductGrid products={data?.products ?? []} loading={loading} />
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-white/40">{page} / {data.totalPages}</span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => changePage(page + 1)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}
