import { toast } from "sonner"

import { ApiClientError } from "@/types/api"

function getDescription(error: unknown, fallback?: string) {
  if (error instanceof ApiClientError) {
    const requestId = error.meta?.request_id
    return requestId ? `${error.message} · Request ID: ${requestId}` : error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function showAdminSuccess(title: string, description?: string) {
  toast.success(title, {
    description,
  })
}

export function showAdminError(title: string, error: unknown, fallback?: string) {
  toast.error(title, {
    description: getDescription(error, fallback),
  })
}
