"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type Category = { id: string; name: string; slug: string }

interface CategoryFilterProps {
  categories: Category[]
}

const typeFilters = [
  { label: "Semua", value: "" },
  { label: "Top Up", value: "TOPUP" },
  { label: "Akun", value: "ACCOUNT" },
  { label: "Voucher", value: "VOUCHER" },
]

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") ?? ""
  const activeType = searchParams.get("type") ?? ""

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((t) => (
          <button
            key={t.value}
            onClick={() => updateParam("type", t.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeType === t.value
                ? "border-violet-500 bg-violet-500/20 text-violet-700 dark:text-violet-300"
                : "border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black/50 dark:text-white/50 hover:border-violet-400/50 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParam("category", "")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeCategory === ""
              ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300"
              : "border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black/50 dark:text-white/50 hover:border-fuchsia-400/50 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
          )}
        >
          Semua Game
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam("category", cat.slug)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === cat.slug
                ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300"
                : "border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black/50 dark:text-white/50 hover:border-fuchsia-400/50 dark:hover:border-white/20 hover:text-black dark:hover:text-white"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}