"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

import { registerSchema, type RegisterInput } from "@/lib/validators/auth.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { ApiResponse } from "@/types/api.types"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  })

  async function onSubmit(values: RegisterInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const json: ApiResponse<{ user: { id: string } }> = await res.json()

      if (!json.success) {
        if (json.error.fields) {
          Object.entries(json.error.fields).forEach(([field, message]) => {
            form.setError(field as keyof RegisterInput, { message })
          })
        }
        toast.error(json.error.message)
        return
      }

      toast.success("Registrasi berhasil! Silakan login.")
      router.push("/login")
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Buat Akun</h1>
          <p className="mt-1 text-sm text-white/50">
            Bergabung dan mulai berbelanja
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama lengkap Anda"
                      autoComplete="name"
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-violet-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contoh@email.com"
                      autoComplete="email"
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-violet-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min. 8 karakter"
                      autoComplete="new-password"
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-violet-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">
                    Konfirmasi Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ulangi password"
                      autoComplete="new-password"
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-violet-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-fuchsia-500"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {loading ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-white/40">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-violet-400 transition-colors hover:text-violet-300"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  )
}