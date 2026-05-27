import { createClient } from "@/lib/supabase/server"
import { AppError } from "@/lib/errors"

export async function listCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw new AppError("Gagal mengambil kategori", "CATEGORY_FETCH_FAILED")
  return data ?? []
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) return null
  return data
}