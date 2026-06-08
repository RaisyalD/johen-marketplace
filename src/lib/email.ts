import { Resend } from "resend"
import { formatRupiah } from "./utils"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const PAYMENT_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
  QRIS: "QRIS",
}

export type OrderEmailItem = {
  product_name: string
  quantity: number
  price: number
  subtotal: number
  delivery_info: string | null
  product_type: string
}

export interface SendOrderEmailParams {
  to: string
  customerName: string
  orderNumber: string
  items: OrderEmailItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
}

function buildDeliverySection(items: OrderEmailItem[]): string {
  const withDelivery = items.filter((i) => i.delivery_info)
  const topupNoDelivery = items.filter((i) => i.product_type === "TOPUP" && !i.delivery_info)

  let html = ""

  if (withDelivery.length > 0) {
    html += `
    <div style="padding:20px 24px;border-bottom:1px solid rgba(109,40,217,0.08);">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">Detail Produk</p>
    `
    for (const item of withDelivery) {
      html += `
      <div style="margin-bottom:14px;">
        <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 8px;">${item.product_name}</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:12px;border:1px solid rgba(109,40,217,0.1);font-family:'Courier New',monospace;font-size:13px;color:#1f2937;white-space:pre-wrap;line-height:1.7;">${item.delivery_info}</div>
      </div>
      `
    }
    html += `</div>`
  }

  if (topupNoDelivery.length > 0) {
    html += `
    <div style="padding:16px 24px;background:#fff7ed;border-bottom:1px solid #fed7aa;">
      <p style="color:#c2410c;font-size:13px;font-weight:600;margin:0 0 4px;">⏱ Proses Top Up</p>
      <p style="color:#9a3412;font-size:13px;margin:0;line-height:1.5;">Top up Anda sedang diproses dan akan selesai dalam <strong>1–5 menit</strong>. Pastikan User ID dan server game Anda sudah benar.</p>
    </div>
    `
  }

  return html
}

export async function sendOrderConfirmationEmail(params: SendOrderEmailParams) {
  const { to, customerName, orderNumber, items, subtotal, discount, total, paymentMethod } = params

  const itemsHTML = items
    .map(
      (item) => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(109,40,217,0.06);">
      <div>
        <p style="color:#0f0e1a;font-size:14px;font-weight:500;margin:0;">${item.product_name}</p>
        <p style="color:#6b7280;font-size:12px;margin:3px 0 0;">×${item.quantity} · ${formatRupiah(item.price)}</p>
      </div>
      <p style="color:#0f0e1a;font-size:14px;font-weight:600;margin:0;white-space:nowrap;padding-left:16px;">${formatRupiah(item.subtotal)}</p>
    </div>
  `
    )
    .join("")

  const discountHTML =
    discount > 0
      ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
           <span style="color:#059669;font-size:13px;">Diskon Voucher</span>
           <span style="color:#059669;font-size:13px;">-${formatRupiah(discount)}</span>
         </div>`
      : ""

  const deliveryHTML = buildDeliverySection(items)

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Konfirmasi Pesanan ${orderNumber}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background-color:#eeeaf8;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(109,40,217,0.12);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#a21caf 100%);padding:28px 24px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">JohenGaming</h1>
      <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:12px;">Marketplace Akun &amp; Top Up Game Terpercaya</p>
    </div>

    <!-- Success banner -->
    <div style="background:#ecfdf5;padding:14px 24px;text-align:center;border-bottom:1px solid #d1fae5;">
      <p style="color:#059669;font-size:15px;font-weight:600;margin:0;">✅ Pesanan Berhasil Dikonfirmasi!</p>
      <p style="color:#6b7280;font-size:13px;margin:5px 0 0;">Halo <strong>${customerName}</strong>, terima kasih sudah berbelanja di Johen Gaming.</p>
    </div>

    <!-- Order number + payment method -->
    <div style="padding:20px 24px;border-bottom:1px solid rgba(109,40,217,0.08);">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Nomor Pesanan</p>
      <p style="color:#0f0e1a;font-size:18px;font-weight:700;font-family:'Courier New',monospace;margin:0 0 8px;">${orderNumber}</p>
      <span style="background:rgba(109,40,217,0.08);color:#7c3aed;border:1px solid rgba(109,40,217,0.2);border-radius:100px;padding:3px 10px;font-size:12px;font-weight:600;">${PAYMENT_LABEL[paymentMethod] ?? paymentMethod}</span>
    </div>

    <!-- Items -->
    <div style="padding:20px 24px;border-bottom:1px solid rgba(109,40,217,0.08);">
      <p style="color:#9ca3af;font-size:11px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Item Pesanan</p>
      ${itemsHTML}
    </div>

    <!-- Delivery info -->
    ${deliveryHTML}

    <!-- Totals -->
    <div style="padding:20px 24px;background:#f7f5ff;border-top:1px solid rgba(109,40,217,0.08);">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#6b7280;font-size:13px;">Subtotal</span>
        <span style="color:#374151;font-size:13px;">${formatRupiah(subtotal)}</span>
      </div>
      ${discountHTML}
      <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid rgba(109,40,217,0.12);">
        <span style="color:#0f0e1a;font-weight:700;font-size:15px;">Total</span>
        <span style="color:#7c3aed;font-weight:800;font-size:17px;">${formatRupiah(total)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:18px 24px;background:#0f0f18;text-align:center;">
      <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">© 2026 Johen Gaming · Terima kasih sudah berbelanja!</p>
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:6px 0 0;">Email ini dikirim otomatis. Jangan balas email ini.</p>
    </div>

  </div>
</body>
</html>
  `

  await getResend().emails.send({
    from: "Johen Gaming <onboarding@resend.dev>",
    to,
    subject: `Pesanan ${orderNumber} Berhasil - Johen Gaming`,
    html,
  })
}