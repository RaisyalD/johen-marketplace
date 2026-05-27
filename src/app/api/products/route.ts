import { NextRequest } from "next/server"
import { productQuerySchema, productCreateSchema } from "@/lib/validators/product.schema"
import { listProducts, createProduct } from "@/services/product.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError, UnauthorizedError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const rawQuery = Object.fromEntries(searchParams.entries())
    const parsed = productQuerySchema.safeParse(rawQuery)

    if (!parsed.success) {
      throw new ValidationError("Parameter query tidak valid")
    }

    // Check if caller is admin (for including inactive products)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      isAdmin = profile?.role === "ADMIN"
    }

    const result = await listProducts(parsed.data, isAdmin)
    return successResponse(result)
  } catch (error) {
    return errorResponse(error, "Gagal mengambil produk")
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UnauthorizedError()

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "ADMIN") throw new UnauthorizedError("Bukan admin")

    const body: unknown = await request.json()
    const parsed = productCreateSchema.safeParse(body)
    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data produk tidak valid", fields)
    }

    const product = await createProduct(parsed.data)
    return successResponse(product, 201)
  } catch (error) {
    return errorResponse(error, "Gagal membuat produk")
  }
}