import { logout } from "@/services/auth.service"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST() {
  try {
    await logout()
    return successResponse({ message: "Berhasil logout" })
  } catch (error) {
    return errorResponse(error, "Logout gagal")
  }
}