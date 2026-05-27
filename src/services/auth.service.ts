import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AppError, UnauthorizedError } from "@/lib/errors"
import type { RegisterInput, LoginInput } from "@/lib/validators/auth.schema"

export async function register(input: Omit<RegisterInput, "confirm_password">) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.full_name },
    },
  })

  if (error) {
    if (error.message.includes("already registered")) {
      throw new AppError("Email sudah terdaftar", "EMAIL_TAKEN", 409)
    }
    throw new AppError(error.message, "REGISTER_FAILED", 400)
  }

  return data.user
}

export async function login(input: LoginInput) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    throw new UnauthorizedError("Email atau password salah")
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single()

  return { user: data.user, role: profile?.role ?? "CUSTOMER" }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new AppError("Gagal logout", "LOGOUT_FAILED")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw new AppError("Profil tidak ditemukan", "PROFILE_NOT_FOUND", 404)
  return data
}