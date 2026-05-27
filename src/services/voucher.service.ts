import { createAdminClient } from "@/lib/supabase/admin"

export async function validateVoucher(code: string, subtotal: number) {
  const admin = createAdminClient()

  const { data: voucher } = await admin
    .from("vouchers")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single()

  if (!voucher) {
    return { valid: false, message: "Kode voucher tidak ditemukan atau sudah tidak aktif" }
  }

  if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
    return { valid: false, message: "Voucher sudah kadaluarsa" }
  }

  if (voucher.min_purchase && subtotal < Number(voucher.min_purchase)) {
    return {
      valid: false,
      message: `Minimum pembelian ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(voucher.min_purchase))}`,
    }
  }

  let discount = 0
  if (voucher.discount_type === "PERCENT") {
    discount = subtotal * (Number(voucher.discount_value) / 100)
    if (voucher.max_discount && discount > Number(voucher.max_discount)) {
      discount = Number(voucher.max_discount)
    }
  } else {
    discount = Number(voucher.discount_value)
  }

  discount = Math.min(discount, subtotal)

  return {
    valid: true,
    message: "Voucher berhasil diterapkan",
    discount,
    finalTotal: subtotal - discount,
    voucherId: voucher.id,
  }
}