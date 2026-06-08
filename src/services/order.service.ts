import { createAdminClient } from "@/lib/supabase/admin"
import { AppError, NotFoundError } from "@/lib/errors"
import { generateOrderNumber } from "@/lib/utils"
import type { OrderCreateInput, OrderQuery } from "@/lib/validators/order.schema"

export async function createOrder(input: OrderCreateInput, userId: string | null) {
  const admin = createAdminClient()

  const orderNumber = generateOrderNumber()

  const items = input.items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }))

  const { data: orderId, error } = await admin.rpc("create_order_atomic", {
    p_order_number: orderNumber,
    p_user_id: userId as unknown as string,
    p_customer_name: input.customer_name,
    p_customer_email: input.customer_email,
    p_customer_phone: (input.customer_phone ?? null) as unknown as string,
    p_items: items,
    p_voucher_code: (input.voucher_code ?? null) as unknown as string,
    p_payment_method: input.payment_method,
  })

  if (error) {
    if (error.message.includes("INSUFFICIENT_STOCK")) {
      const productName = error.message.split(": ")[1] ?? "produk"
      throw new AppError(`Stok ${productName} tidak mencukupi`, "INSUFFICIENT_STOCK", 409)
    }
    if (error.message.includes("PRODUCT_NOT_FOUND")) {
      throw new AppError("Produk tidak ditemukan", "PRODUCT_NOT_FOUND", 404)
    }
    throw new AppError("Gagal membuat pesanan: " + error.message, "ORDER_CREATE_FAILED")
  }

  return { orderNumber, orderId: orderId as string }
}

export async function listOrders(query: OrderQuery) {
  const admin = createAdminClient()

  let q = admin
    .from("orders")
    .select("id, order_number, customer_name, customer_email, total, status, payment_method, created_at", { count: "exact" })
    .order("created_at", { ascending: false })

  if (query.status) {
    q = q.eq("status", query.status)
  }

  const from = (query.page - 1) * query.limit
  q = q.range(from, from + query.limit - 1)

  const { data, count, error } = await q
  if (error) throw new AppError("Gagal mengambil daftar pesanan", "ORDERS_FETCH_FAILED")

  return {
    orders: data ?? [],
    total: count ?? 0,
    page: query.page,
    totalPages: Math.ceil((count ?? 0) / query.limit),
  }
}

const VALID_STATUSES = ["PENDING", "PAID", "COMPLETED", "FAILED", "CANCELLED"] as const

export async function updateOrderStatus(orderNumber: string, status: string) {
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    throw new AppError("Status tidak valid", "INVALID_STATUS", 400)
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .update({ status })
    .eq("order_number", orderNumber)
    .select("order_number, status")
    .single()
  if (error || !data) throw new NotFoundError("Pesanan")
  return data
}

export async function getOrderByNumber(orderNumber: string) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(id, product_name, price, quantity, subtotal, products(delivery_info, product_type))")
    .eq("order_number", orderNumber)
    .single()

  if (error || !data) throw new NotFoundError("Pesanan")
  return data
}