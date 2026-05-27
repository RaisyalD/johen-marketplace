import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AppError, NotFoundError } from "@/lib/errors"
import type { ProductCreateInput, ProductUpdateInput, ProductQuery } from "@/lib/validators/product.schema"

export async function listProducts(query: ProductQuery, isAdmin = false) {
  const supabase = isAdmin ? createAdminClient() : await createClient()

  let q = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })

  if (!isAdmin) {
    q = q.neq("status", "INACTIVE")
  } else if (query.status) {
    q = q.eq("status", query.status)
  }

  if (query.search) {
    q = q.ilike("name", `%${query.search}%`)
  }

  if (query.type) {
    q = q.eq("product_type", query.type)
  }

  if (query.category) {
    // resolve slug → id
    const adminClient = createAdminClient()
    const { data: cat } = await adminClient
      .from("categories")
      .select("id")
      .eq("slug", query.category)
      .single()
    if (cat) q = q.eq("category_id", cat.id)
  }

  switch (query.sort) {
    case "price_asc":
      q = q.order("price", { ascending: true })
      break
    case "price_desc":
      q = q.order("price", { ascending: false })
      break
    case "name":
      q = q.order("name", { ascending: true })
      break
    default:
      q = q.order("created_at", { ascending: false })
  }

  const from = (query.page - 1) * query.limit
  q = q.range(from, from + query.limit - 1)

  const { data, count, error } = await q

  if (error) throw new AppError("Gagal mengambil produk", "PRODUCT_FETCH_FAILED")

  return {
    products: data ?? [],
    total: count ?? 0,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil((count ?? 0) / query.limit),
  }
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .single()

  if (error || !data) throw new NotFoundError("Produk")
  return data
}

export async function createProduct(input: ProductCreateInput) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("products")
    .insert(input)
    .select()
    .single()

  if (error) throw new AppError("Gagal membuat produk: " + error.message, "PRODUCT_CREATE_FAILED")
  return data
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error || !data) throw new AppError("Gagal memperbarui produk", "PRODUCT_UPDATE_FAILED")
  return data
}

export async function deleteProduct(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("products").delete().eq("id", id)
  if (error) throw new AppError("Gagal menghapus produk", "PRODUCT_DELETE_FAILED")
}

export async function getDashboardStats() {
  const admin = createAdminClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [products, orders, revenue, recentOrders] = await Promise.all([
    admin.from("products").select("id, status", { count: "exact" }),
    admin.from("orders").select("id", { count: "exact" }),
    admin.from("orders").select("total").in("status", ["PAID", "COMPLETED"]),
    admin
      .from("orders")
      .select("total, created_at")
      .in("status", ["PAID", "COMPLETED"])
      .gte("created_at", sevenDaysAgo.toISOString()),
  ])

  const totalRevenue = (revenue.data ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0)

  // Build last 7 days revenue map
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
    dayMap[key] = 0
  }
  for (const o of recentOrders.data ?? []) {
    if (!o.created_at) continue
    const key = new Date(o.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
    if (key in dayMap) dayMap[key] += o.total ?? 0
  }
  const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue }))

  return {
    totalProducts: products.count ?? 0,
    totalOrders: orders.count ?? 0,
    totalRevenue,
    revenueByDay,
  }
}