import { NextRequest } from "next/server"
import { voucherValidateSchema } from "@/lib/validators/voucher.schema"
import { validateVoucher } from "@/services/voucher.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const parsed = voucherValidateSchema.safeParse(body)

    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data tidak valid", fields)
    }

    const result = await validateVoucher(parsed.data.code, parsed.data.subtotal)
    return successResponse(result)
  } catch (error) {
    return errorResponse(error, "Gagal memvalidasi voucher")
  }
}