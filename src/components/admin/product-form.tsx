"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Upload, X, ImageIcon, Tag, Package, DollarSign, Layers } from "lucide-react"
import Image from "next/image"

import { productCreateSchema, type ProductCreateInput } from "@/lib/validators/product.schema"
import { createClient } from "@/lib/supabase/client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { ApiResponse } from "@/types/api.types"

type Category = { id: string; name: string; slug: string }
type Product = ProductCreateInput & { id: string }

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
}

const inputCls = "h-10 border border-white/15 bg-white/[0.07] text-white placeholder:text-white/25 focus-visible:border-violet-500/60 focus-visible:ring-2 focus-visible:ring-violet-500/20 transition-colors"
const selectTriggerCls = "h-10 border border-white/15 bg-white/[0.07] text-white focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
const labelCls = "text-xs font-semibold uppercase tracking-wide text-white/50"

export function ProductForm({ open, onClose, onSuccess, product }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const isEdit = !!product

  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0,
      status: "AVAILABLE", product_type: "TOPUP",
      category_id: null, image_url: null,
    },
  })

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data) })
  }, [])

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        stock: product.stock,
        status: product.status,
        product_type: product.product_type,
        category_id: product.category_id ?? null,
        image_url: product.image_url ?? null,
      })
      setImagePreview(product.image_url ?? null)
    } else {
      form.reset({
        name: "", description: "", price: 0, stock: 0,
        status: "AVAILABLE", product_type: "TOPUP",
        category_id: null, image_url: null,
      })
      setImagePreview(null)
    }
  }, [product, form])

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("product-images").getPublicUrl(path)
      form.setValue("image_url", data.publicUrl)
      setImagePreview(data.publicUrl)
      toast.success("Gambar berhasil diupload")
    } catch {
      toast.error("Gagal upload gambar")
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: ProductCreateInput) {
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json: ApiResponse<unknown> = await res.json()
      if (!json.success) { toast.error(json.error.message); return }
      toast.success(isEdit ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!")
      onSuccess()
      onClose()
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#0d0d16] p-0 text-white sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-white/8 bg-white/2 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
              <Package className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-white">
                {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
              </SheetTitle>
              <SheetDescription className="text-xs text-white/40">
                {isEdit ? "Perbarui informasi produk" : "Isi semua field yang diperlukan"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Image Upload */}
              <div className="space-y-2">
                <p className={labelCls + " flex items-center gap-1.5"}>
                  <ImageIcon className="h-3 w-3" /> Gambar Produk
                </p>
                <div className={`relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${imagePreview ? "border-violet-500/40" : "border-white/10 hover:border-white/20"}`}>
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      <button
                        type="button"
                        onClick={() => { form.setValue("image_url", null); setImagePreview(null) }}
                        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                      <span className="relative text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                        Klik × untuk ganti
                      </span>
                    </>
                  ) : (
                    <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 px-4 py-6 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                        ) : (
                          <Upload className="h-5 w-5 text-white/30" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/60">
                          {uploading ? "Mengupload gambar..." : "Klik untuk upload gambar"}
                        </p>
                        <p className="text-xs text-white/25 mt-0.5">PNG, JPG, WEBP · Maks 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Nama */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls + " flex items-center gap-1.5"}>
                    <Tag className="h-3 w-3" /> Nama Produk <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Top Up Diamond MLBB 86 DM" className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )} />

              {/* Deskripsi */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail produk, cara pembelian, dsb."
                      rows={3}
                      className={inputCls + " h-auto resize-none py-2.5"}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )} />

              <Separator className="bg-white/5" />

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls + " flex items-center gap-1.5"}>
                      <DollarSign className="h-3 w-3" /> Harga (Rp) <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={0} placeholder="0"
                        className={inputCls}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Stok <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={0} placeholder="0"
                        className={inputCls}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )} />
              </div>

              {/* Tipe & Status */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="product_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls + " flex items-center gap-1.5"}>
                      <Layers className="h-3 w-3" /> Tipe <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/10 bg-[#15151f] text-white">
                        <SelectItem value="TOPUP">🎮 Top Up</SelectItem>
                        <SelectItem value="ACCOUNT">👤 Akun</SelectItem>
                        <SelectItem value="VOUCHER">🎟️ Voucher</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Status <span className="text-red-400">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/10 bg-[#15151f] text-white">
                        <SelectItem value="AVAILABLE">✅ Available</SelectItem>
                        <SelectItem value="SOLD">🔴 Sold</SelectItem>
                        <SelectItem value="INACTIVE">⚫ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )} />
              </div>

              {/* Kategori */}
              <FormField control={form.control} name="category_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Kategori Game</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-white/10 bg-[#15151f] text-white">
                      <SelectItem value="none" className="text-white/40">— Tanpa kategori —</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )} />

            </form>
          </Form>
        </div>

        {/* Footer actions — sticky */}
        <div className="border-t border-white/8 bg-[#0d0d16] px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-sm font-medium text-white/70 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={form.formState.isSubmitting || uploading}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}