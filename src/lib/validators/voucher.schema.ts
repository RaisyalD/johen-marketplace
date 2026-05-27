import { z } from "zod"

export const voucherValidateSchema = z.object({
  code: z.string().min(1, "Kode voucher wajib diisi"),
  subtotal: z.number().min(0),
})

export type VoucherValidateInput = z.infer<typeof voucherValidateSchema>