import { NextRequest } from "next/server"
import { orderCreateSchema, orderQuerySchema } from "@/lib/validators/order.schema"
import { createOrder, listOrders } from "@/services/order.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError, UnauthorizedError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const parsed = orderCreateSchema.safeParse(body)

    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data pesanan tidak valid", fields)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await createOrder(parsed.data, user?.id ?? null)
    return successResponse(result, 201)
  } catch (error) {
    return errorResponse(error, "Gagal membuat pesanan")
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UnauthorizedError("Unauthorized")

    const admin = createAdminClient()
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "ADMIN") throw new UnauthorizedError("Forbidden")

    const { searchParams } = new URL(request.url)
    const query = orderQuerySchema.parse({
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "20",
      status: searchParams.get("status") ?? undefined,
    })

    const data = await listOrders(query)
    return successResponse(data)
  } catch (error) {
    return errorResponse(error, "Gagal mengambil pesanan")
  }
}