import { z } from "zod"

export const orderCreateSchema = z.object({
  customer_name: z.string().min(2, "Nama minimal 2 karakter"),
  customer_email: z.string().email("Format email tidak valid"),
  customer_phone: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.string().uuid("ID produk tidak valid"),
      quantity: z.number().int().min(1, "Jumlah minimal 1"),
    })
  ).min(1, "Keranjang tidak boleh kosong"),
  voucher_code: z.string().optional().nullable(),
  payment_method: z.enum(["BANK_TRANSFER", "EWALLET", "QRIS"], {
    error: "Pilih metode pembayaran",
  }),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["PENDING", "PAID", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
export type OrderQuery = z.infer<typeof orderQuerySchema>