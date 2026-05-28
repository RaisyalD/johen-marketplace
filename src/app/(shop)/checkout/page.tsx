"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, ShoppingBag, Tag, CreditCard, ChevronRight, CheckCircle2, Banknote, Wallet, QrCode } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/stores/cart.store"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import type { ApiResponse } from "@/types/api.types"
import { createClient } from "@/lib/supabase/client"
import { PaymentModal } from "@/components/shop/payment-modal"

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Nama minimal 2 karakter"),
  customer_email: z.email({ error: "Format email tidak valid" }),
  customer_phone: z.string().optional(),
  payment_method: z.enum(["BANK_TRANSFER", "EWALLET", "QRIS"]),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

type VoucherResult = { valid: boolean; message: string; discount?: number; finalTotal?: number }

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "Transfer Bank", desc: "BCA, Mandiri, BNI, BRI", icon: Banknote },
  { value: "EWALLET", label: "E-Wallet", desc: "GoPay, OVO, DANA, ShopeePay", icon: Wallet },
  { value: "QRIS", label: "QRIS", desc: "Scan dengan aplikasi apapun", icon: QrCode },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [voucherCode, setVoucherCode] = useState("")
  const [voucher, setVoucher] = useState<VoucherResult | null>(null)
  const [applyingVoucher, setApplyingVoucher] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<CheckoutFormValues | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const subtotal = getTotal()
  const discount = voucher?.valid ? (voucher.discount ?? 0) : 0
  const total = subtotal - discount

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      payment_method: "BANK_TRANSFER",
    },
  })

  // Auto-fill from logged-in user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      form.setValue("customer_email", user.email ?? "")
      if (user.user_metadata?.full_name) {
        form.setValue("customer_name", user.user_metadata.full_name)
      }
    })
  }, [form])

  // Redirect if cart empty — but NOT after successful submission (clearCart triggers this)
  useEffect(() => {
    if (items.length === 0 && !submitted) router.push("/shop")
  }, [items.length, submitted, router])

  async function applyVoucher() {
    if (!voucherCode.trim()) return
    setApplyingVoucher(true)
    setVoucher(null)
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode.trim(), subtotal }),
      })
      const json: ApiResponse<VoucherResult> = await res.json()
      if (json.success) {
        setVoucher(json.data)
        if (json.data.valid) toast.success("Voucher diterapkan!")
        else toast.error(json.data.message)
      }
    } catch {
      toast.error("Gagal memeriksa voucher")
    } finally {
      setApplyingVoucher(false)
    }
  }

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) return
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setProcessing(false)
    setPendingValues(values)
    setPaymentOpen(true)
  }

  async function confirmPayment() {
    if (!pendingValues) return
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: pendingValues.customer_name,
        customer_email: pendingValues.customer_email,
        customer_phone: pendingValues.customer_phone || null,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        voucher_code: voucher?.valid ? voucherCode.trim() : null,
        payment_method: pendingValues.payment_method,
      }),
    })
    const json: ApiResponse<{ orderNumber: string }> = await res.json()
    if (!json.success) {
      toast.error(json.error.message)
      throw new Error(json.error.message)
    }
    setPaymentOpen(false)
    setSubmitted(true)
    clearCart()
    router.push(`/order-success/${json.data.orderNumber}`)
  }

  if (items.length === 0 && !submitted) return null

  const selectedPayment = form.watch("payment_method")

  const sectionCard = "rounded-xl border border-violet-200/60 dark:border-white/8 bg-white dark:bg-white/3 p-5"
  const sectionHeading = "mb-4 text-sm font-semibold uppercase tracking-wide text-black/40 dark:text-white/50 flex items-center gap-1.5"
  const inputClass = "h-10 border-violet-200/70 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus-visible:ring-violet-500"
  const labelClass = "text-xs text-slate-600 dark:text-white/50"

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Checkout</h1>
        <p className="text-sm text-black/40 dark:text-white/40 mt-0.5">Selesaikan pesananmu</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            {/* LEFT: Form */}
            <div className="space-y-5">
              {/* Customer Info */}
              <div className={sectionCard}>
                <h2 className={sectionHeading}>
                  <ChevronRight className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                  Informasi Pembeli
                </h2>
                <div className="space-y-4">
                  <FormField control={form.control} name="customer_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Nama Lengkap *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama kamu" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 dark:text-red-400" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customer_email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@kamu.com" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 dark:text-red-400" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customer_phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>No. HP (opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="08xxxxxxxxxx" className={inputClass} {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Voucher */}
              <div className={sectionCard}>
                <h2 className={sectionHeading}>
                  <Tag className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                  Kode Voucher
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucher(null) }}
                    className={`${inputClass} font-mono`}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyVoucher())}
                  />
                  <Button
                    type="button"
                    onClick={applyVoucher}
                    disabled={!voucherCode.trim() || applyingVoucher}
                    className="h-10 shrink-0 bg-violet-600/20 border border-violet-500/30 text-violet-700 dark:text-violet-300 hover:bg-violet-600/30 disabled:opacity-40"
                  >
                    {applyingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terapkan"}
                  </Button>
                </div>
                {voucher && (
                  <div className={`mt-2 flex items-center gap-1.5 text-xs ${voucher.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {voucher.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    {voucher.message}
                  </div>
                )}
                <p className="mt-2 text-xs text-black/25 dark:text-white/25">Coba: NEWUSER50 · DISKON10 · HEMAT25K</p>
              </div>

              {/* Payment Method */}
              <div className={sectionCard}>
                <h2 className={sectionHeading}>
                  <CreditCard className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                  Metode Pembayaran
                </h2>
                <FormField control={form.control} name="payment_method" render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {paymentMethods.map(({ value, label, desc, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                            selectedPayment === value
                              ? "border-violet-500/60 bg-violet-500/10"
                              : "border-violet-200/60 dark:border-white/8 bg-violet-50/30 dark:bg-white/2 hover:border-violet-400/60 dark:hover:border-white/15"
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selectedPayment === value ? "bg-violet-500/20" : "bg-violet-100/60 dark:bg-white/5"}`}>
                            <Icon className={`h-4 w-4 ${selectedPayment === value ? "text-violet-600 dark:text-violet-400" : "text-violet-400/60 dark:text-white/40"}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${selectedPayment === value ? "text-violet-700 dark:text-white" : "text-slate-700 dark:text-white/70"}`}>{label}</p>
                            <p className="text-xs text-black/30 dark:text-white/30 mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <FormMessage className="text-xs text-red-500 dark:text-red-400" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="space-y-4">
              <div className={`${sectionCard} sticky top-20`}>
                <h2 className={sectionHeading}>
                  <ShoppingBag className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-violet-50 dark:bg-white/5 border border-violet-100 dark:border-white/5">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-black/20 dark:text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-black/40 dark:text-white/40">×{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4 bg-violet-200/40 dark:bg-white/8" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-black/50 dark:text-white/60">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Diskon Voucher</span>
                      <span>-{formatRupiah(discount)}</span>
                    </div>
                  )}
                  <Separator className="bg-violet-200/40 dark:bg-white/8" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  className="mt-5 w-full h-11 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi pesanan...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Lanjut Bayar · {formatRupiah(total)}
                    </>
                  )}
                </Button>
                <p className="mt-2 text-center text-xs text-black/25 dark:text-white/25">Pilih metode → instruksi pembayaran akan muncul</p>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {pendingValues && (
        <PaymentModal
          open={paymentOpen}
          paymentMethod={pendingValues.payment_method}
          total={total}
          onConfirm={confirmPayment}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </div>
  )
}