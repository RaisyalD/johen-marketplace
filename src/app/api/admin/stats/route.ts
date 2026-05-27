import { getDashboardStats } from "@/services/product.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { UnauthorizedError } from "@/lib/errors"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UnauthorizedError()
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "ADMIN") throw new UnauthorizedError("Bukan admin")

    const stats = await getDashboardStats()
    return successResponse(stats)
  } catch (error) {
    return errorResponse(error, "Gagal mengambil statistik")
  }
}