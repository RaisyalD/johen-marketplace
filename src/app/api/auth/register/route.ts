import { NextRequest } from "next/server"
import { registerSchema } from "@/lib/validators/auth.schema"
import { register } from "@/services/auth.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data registrasi tidak valid", fields)
    }

    const { confirm_password: _confirmPassword, ...input } = parsed.data
    const user = await register(input)

    return successResponse({ user: { id: user?.id, email: user?.email } }, 201)
  } catch (error) {
    return errorResponse(error, "Registrasi gagal")
  }
}