"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, LogIn } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema"
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
import { useCartStore } from "@/stores/cart.store"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const clearCart = useCartStore((s) => s.clearCart)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const json: ApiResponse<{ role: string }> = await res.json()

      if (!json.success) {
        toast.error(json.error.message)
        return
      }

      clearCart()
      toast.success("Login berhasil! Mengalihkan...")
      router.refresh()

      if (json.data.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/shop")
      }
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
          <h1 className="text-2xl font-bold text-white">Selamat Datang</h1>
          <p className="mt-1 text-sm text-white/50">
            Login untuk mulai berbelanja
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="••••••••"
                      autoComplete="current-password"
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
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-fuchsia-500"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-white/40">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-violet-400 transition-colors hover:text-violet-300"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}