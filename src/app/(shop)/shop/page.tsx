import { Suspense } from "react"
import { ShopContent } from "./shop-content"

export const metadata = {
  title: "Toko",
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  )
}