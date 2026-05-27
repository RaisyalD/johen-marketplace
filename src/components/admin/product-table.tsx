"use client"

import { useState } from "react"
import Image from "next/image"
import { Pencil, Trash2, Package } from "lucide-react"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ApiResponse } from "@/types/api.types"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  status: string
  product_type: string
  image_url: string | null
  categories: { name: string } | null
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: () => void
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  SOLD: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  INACTIVE: "bg-white/10 text-white/40 border-white/10",
}

const typeColors: Record<string, string> = {
  TOPUP: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACCOUNT: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  VOUCHER: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" })
      const json: ApiResponse<unknown> = await res.json()
      if (!json.success) { toast.error(json.error.message); return }
      toast.success("Produk berhasil dihapus")
      onDelete()
    } catch {
      toast.error("Gagal menghapus produk")
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] py-16 text-center">
        <Package className="h-10 w-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">Belum ada produk</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40 w-12"></TableHead>
              <TableHead className="text-white/40">Nama</TableHead>
              <TableHead className="text-white/40">Kategori</TableHead>
              <TableHead className="text-white/40">Tipe</TableHead>
              <TableHead className="text-white/40 text-right">Harga</TableHead>
              <TableHead className="text-white/40 text-center">Stok</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02]">
                <TableCell>
                  <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white/5">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-4 w-4 text-white/20" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-white max-w-[180px] truncate">
                  {p.name}
                </TableCell>
                <TableCell className="text-white/50 text-sm">
                  {p.categories?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs border ${typeColors[p.product_type] ?? ""}`}>
                    {p.product_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-white/80 text-sm">
                  {formatRupiah(p.price)}
                </TableCell>
                <TableCell className="text-center text-white/70 text-sm">{p.stock}</TableCell>
                <TableCell>
                  <Badge className={`text-xs border ${statusColors[p.status] ?? ""}`}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0d0d14] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/10">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}