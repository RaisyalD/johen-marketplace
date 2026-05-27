import { NextRequest } from "next/server"
import { loginSchema } from "@/lib/validators/auth.schema"
import { login } from "@/services/auth.service"
import { successResponse, errorResponse } from "@/lib/api-response"
import { ValidationError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      const fields: Record<string, string> = {}
      parsed.error.issues.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message
      })
      throw new ValidationError("Data login tidak valid", fields)
    }

    const { user, role } = await login(parsed.data)

    return successResponse({
      user: { id: user.id, email: user.email },
      role,
    })
  } catch (error) {
    return errorResponse(error, "Login gagal")
  }
}