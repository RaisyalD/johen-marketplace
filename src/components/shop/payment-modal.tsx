"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { Copy, Check, Loader2, Banknote, Wallet, QrCode } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type PaymentMethod = "BANK_TRANSFER" | "EWALLET" | "QRIS"

export interface PaymentModalProps {
  open: boolean
  paymentMethod: PaymentMethod
  total: number
  onConfirm: () => Promise<void>
  onClose: () => void
}

const banks = [
  { id: "BCA", name: "BCA", prefix: "7007", color: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30" },
  { id: "MANDIRI", name: "Mandiri", prefix: "88908", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30" },
  { id: "BNI", name: "BNI", prefix: "8277", color: "bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30" },
  { id: "BRI", name: "BRI", prefix: "8800", color: "bg-blue-600/20 text-blue-700 dark:text-blue-200 border-blue-600/30" },
]

const ewallets = [
  { id: "GOPAY", name: "GoPay", color: "bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30" },
  { id: "OVO", name: "OVO", color: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30" },
  { id: "DANA", name: "DANA", color: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30" },
  { id: "SHOPEE", name: "ShopeePay", color: "bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30" },
]

function generateVA(prefix: string): string {
  const rand = Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)
  return `${prefix}${rand}`
}

function formatVA(va: string): string {
  return va.replace(/(\d{4})(?=\d)/g, "$1-")
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label} disalin`)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-200/60 dark:border-white/10 text-black/40 dark:text-white/40 transition-colors hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

export function PaymentModal({ open, paymentMethod, total, onConfirm, onClose }: PaymentModalProps) {
  const [confirming, setConfirming] = useState(false)
  const [selectedBank, setSelectedBank] = useState(banks[0])
  const [selectedWallet, setSelectedWallet] = useState(ewallets[0])
  const [vaNumbers] = useState(() => Object.fromEntries(banks.map((b) => [b.id, generateVA(b.prefix)])))
  const [qrRef] = useState(() => `JHN-${Date.now()}`)
  const qrValue = `https://payment.johengaming.demo/pay?method=${paymentMethod}&amount=${total}&ref=${qrRef}`

  const currentVA = vaNumbers[selectedBank.id]

  async function handleConfirm() {
    setConfirming(true)
    try {
      await onConfirm()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !confirming && onClose()}>
      <DialogContent
        className="max-w-md border-violet-200/60 dark:border-white/10 text-slate-900 dark:text-white p-0 overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        {/* Header */}
        <DialogHeader className="border-b border-violet-200/40 dark:border-white/8 bg-violet-50/50 dark:bg-white/2 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
              {paymentMethod === "BANK_TRANSFER" && <Banknote className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
              {paymentMethod === "EWALLET" && <Wallet className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
              {paymentMethod === "QRIS" && <QrCode className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                {paymentMethod === "BANK_TRANSFER" && "Transfer Bank"}
                {paymentMethod === "EWALLET" && "Pembayaran E-Wallet"}
                {paymentMethod === "QRIS" && "Pembayaran QRIS"}
              </DialogTitle>
              <DialogDescription className="text-xs text-black/40 dark:text-white/40">
                Selesaikan pembayaran untuk mengonfirmasi pesanan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Amount */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-center">
            <p className="text-xs text-black/40 dark:text-white/40 mb-0.5">Total Pembayaran</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
              {formatRupiah(total)}
            </p>
          </div>

          {/* BANK TRANSFER */}
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2">Pilih Bank</p>
                <div className="grid grid-cols-4 gap-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                        selectedBank.id === bank.id
                          ? bank.color
                          : "border-violet-200/60 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-violet-300 dark:hover:border-white/20"
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-violet-200/60 dark:border-white/8 bg-white dark:bg-white/3 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-black/40 dark:text-white/40 mb-0.5">Nomor Virtual Account {selectedBank.name}</p>
                    <p className="font-mono text-lg font-bold text-slate-900 dark:text-white tracking-wider">
                      {formatVA(currentVA)}
                    </p>
                  </div>
                  <CopyButton value={currentVA} label="Nomor VA" />
                </div>
                <Separator className="bg-violet-200/40 dark:bg-white/5" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-black/40 dark:text-white/40 mb-0.5">Jumlah Transfer</p>
                    <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(total)}</p>
                  </div>
                  <CopyButton value={String(total)} label="Nominal" />
                </div>
              </div>

              <div className="rounded-lg border border-violet-200/40 dark:border-white/5 bg-violet-50/50 dark:bg-white/2 p-3 space-y-1.5 text-xs text-black/40 dark:text-white/40">
                <p className="font-medium text-black/50 dark:text-white/60 text-xs">Cara Transfer:</p>
                <p>1. Buka m-Banking / ATM {selectedBank.name}</p>
                <p>2. Pilih Transfer → Virtual Account</p>
                <p>3. Masukkan nomor VA di atas</p>
                <p>4. Masukkan jumlah transfer tepat</p>
                <p>5. Konfirmasi & selesaikan pembayaran</p>
                <p className="text-yellow-600 dark:text-yellow-400/70 mt-1">⏱ Berlaku 24 jam</p>
              </div>
            </div>
          )}

          {/* EWALLET */}
          {paymentMethod === "EWALLET" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2">Pilih Dompet Digital</p>
                <div className="grid grid-cols-4 gap-2">
                  {ewallets.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWallet(w)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                        selectedWallet.id === w.id
                          ? w.color
                          : "border-violet-200/60 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-violet-300 dark:hover:border-white/20"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border border-violet-200/60 dark:border-white/10 bg-white p-3">
                  <QRCodeSVG
                    value={qrValue}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#1a0533"
                    level="M"
                  />
                </div>
                <p className="text-xs text-black/40 dark:text-white/40 text-center">
                  Scan QR dengan aplikasi <span className="text-slate-700 dark:text-white/70 font-medium">{selectedWallet.name}</span>
                </p>
              </div>

              <button
                onClick={() => toast.info(`Simulasi: membuka aplikasi ${selectedWallet.name}...`)}
                className="w-full rounded-lg border border-violet-200/60 dark:border-white/10 bg-white dark:bg-white/5 py-2.5 text-sm font-medium text-slate-600 dark:text-white/70 transition-colors hover:bg-violet-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              >
                Buka Aplikasi {selectedWallet.name}
              </button>
            </div>
          )}

          {/* QRIS */}
          {paymentMethod === "QRIS" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border-2 border-violet-500/30 bg-white p-4 relative">
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1a0533"
                    level="M"
                  />
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-violet-500/30 px-3 py-0.5 text-[10px] font-bold tracking-widest text-violet-600 dark:text-violet-400"
                    style={{ backgroundColor: "var(--brand-surface)" }}
                  >
                    QRIS
                  </div>
                </div>
                <p className="text-xs text-black/40 dark:text-white/40 text-center mt-2">
                  Scan menggunakan aplikasi apapun yang mendukung QRIS
                  <br />
                  <span className="text-black/25 dark:text-white/25">(GoPay, OVO, Dana, m-Banking, dll)</span>
                </p>
              </div>

              <div className="rounded-lg border border-violet-200/40 dark:border-white/5 bg-violet-50/50 dark:bg-white/2 p-3 text-xs text-black/40 dark:text-white/40 space-y-1">
                <p>1. Buka aplikasi pembayaran favorit kamu</p>
                <p>2. Pilih fitur Scan / QRIS</p>
                <p>3. Arahkan kamera ke QR di atas</p>
                <p>4. Pastikan nominal sesuai, lalu konfirmasi</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-violet-200/40 dark:border-white/8 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-violet-200/60 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-white/60 transition-colors hover:bg-violet-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
          >
            Batalkan
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
            {paymentMethod === "BANK_TRANSFER" && "Saya Sudah Transfer"}
            {paymentMethod === "EWALLET" && "Konfirmasi Pembayaran"}
            {paymentMethod === "QRIS" && "Sudah Bayar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}