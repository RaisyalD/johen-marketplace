import { NextRequest } from "next/server"
import { getOrderByNumber, updateOrderStatus } from "@/services/order.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { AppError } from "@/lib/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params
    const order = await getOrderByNumber(orderNumber)
    return successResponse(order)
  } catch (error) {
    return errorResponse(error, "Gagal mengambil detail pesanan")
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Unauthorized", "UNAUTHORIZED", 401)

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "ADMIN") throw new AppError("Forbidden", "FORBIDDEN", 403)

    const { orderNumber } = await params
    const body = await request.json()
    const updated = await updateOrderStatus(orderNumber, body.status)
    return successResponse(updated)
  } catch (error) {
    return errorResponse(error, "Gagal mengupdate status pesanan")
  }
}