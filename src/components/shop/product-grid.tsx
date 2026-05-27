import { ProductCard } from "@/components/shop/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PackageSearch } from "lucide-react"

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

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
            <Skeleton className="aspect-4/3 w-full bg-white/5" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-16 bg-white/5" />
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-5 w-20 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/2 py-20 text-center">
        <PackageSearch className="h-12 w-12 text-white/10 mb-3" />
        <p className="text-white/40 text-sm">Produk tidak ditemukan</p>
        <p className="text-white/25 text-xs mt-1">Coba ubah filter pencarian</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}