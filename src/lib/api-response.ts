import { NextResponse } from "next/server"
import { AppError, ValidationError } from "./errors"

export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = {
  success: false
  error: { code: string; message: string; fields?: Record<string, string> }
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status })
}

export function errorResponse(
  error: unknown,
  fallbackMessage = "Terjadi kesalahan"
) {
  if (error instanceof ValidationError) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: { code: error.code, message: error.message },
      },
      { status: error.statusCode }
    )
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error)
  }

  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: fallbackMessage },
    },
    { status: 500 }
  )
}