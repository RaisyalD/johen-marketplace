import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-fuchsia-700/20 blur-[120px]" />
      </div>

      <div className="relative text-center">
        <p className="text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-violet-400 to-fuchsia-600 select-none">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mt-2">Halaman Tidak Ditemukan</h1>
        <p className="text-white/50 mt-2 mb-8 max-w-sm mx-auto text-sm">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition-all hover:from-violet-500 hover:to-fuchsia-500"
          >
            Ke Toko
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}