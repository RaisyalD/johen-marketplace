import { NextRequest } from "next/server"
import { productUpdateSchema } from "@/lib/validators/product.schema"
import { getProductById, updateProduct, deleteProduct } from "@/services/product.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError, UnauthorizedError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new UnauthorizedError()
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "ADMIN") throw new UnauthorizedError("Bukan admin")
  return user
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    return successResponse(product)
  } catch (error) {
    return errorResponse(error, "Produk tidak ditemukan")
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = productUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data produk tidak valid", fields)
    }
    const product = await updateProduct(id, parsed.data)
    return successResponse(product)
  } catch (error) {
    return errorResponse(error, "Gagal memperbarui produk")
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteProduct(id)
    return successResponse({ message: "Produk berhasil dihapus" })
  } catch (error) {
    return errorResponse(error, "Gagal menghapus produk")
  }
}