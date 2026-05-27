import { listCategories } from "@/services/category.service"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET() {
  try {
    const categories = await listCategories()
    return successResponse(categories)
  } catch (error) {
    return errorResponse(error, "Gagal mengambil kategori")
  }
}