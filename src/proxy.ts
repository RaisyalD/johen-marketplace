import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Admin can browse shop but cannot transact
const ADMIN_BLOCKED_ROUTES = ["/checkout", "/order-success"]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be called before any auth checks
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Fetch role once for all checks (only when user is logged in)
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    role = profile?.role ?? null
  }

  // 1. Protect /admin/* — require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url))
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/shop", request.url))
  }

  // 2. Block ADMIN from transactional routes only (can still browse shop)
  const isBlockedRoute = ADMIN_BLOCKED_ROUTES.some((r) => pathname.startsWith(r))
  if (user && role === "ADMIN" && isBlockedRoute) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // 3. Redirect logged-in users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const dest = role === "ADMIN" ? "/admin" : "/shop"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}