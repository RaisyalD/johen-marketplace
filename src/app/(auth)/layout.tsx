import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: {
    template: "%s | Johen Gaming",
    default: "Johen Gaming - Marketplace Akun & Top Up Game",
  },
  description:
    "Marketplace terpercaya untuk jual beli akun game, top up, dan voucher digital.",
  icons: {
    icon: "/images/johen.jpeg",
    apple: "/images/johen.jpeg",
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "var(--brand-bg)" }}>
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link href="/shop" className="mb-8 flex items-center gap-2">
          <Image src="/images/johen.jpeg" alt="Johen Gaming" width={40} height={40} className="rounded-xl shadow-lg shadow-violet-500/30" />
          <span className="text-2xl font-bold text-white">
            Johen<span className="text-violet-400">Gaming</span>
          </span>
        </Link>

        {children}

        <p className="mt-8 text-xs text-black/30 dark:text-white/30">
          © 2026 Johen Gaming. All rights reserved.
        </p>
      </div>
    </div>
  )
}