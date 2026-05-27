import { z } from "zod"

export const productCreateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(200),
  description: z.string().max(2000).optional().nullable(),
  price: z.number({ error: "Harga harus berupa angka" }).min(0, "Harga tidak boleh negatif"),
  stock: z
    .number({ error: "Stok harus berupa angka" })
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
  status: z.enum(["AVAILABLE", "SOLD", "INACTIVE"]),
  product_type: z.enum(["ACCOUNT", "TOPUP", "VOUCHER"]),
  category_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
})

export const productUpdateSchema = productCreateSchema.partial()

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["ACCOUNT", "TOPUP", "VOUCHER"]).optional(),
  status: z.enum(["AVAILABLE", "SOLD", "INACTIVE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).default("newest"),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>