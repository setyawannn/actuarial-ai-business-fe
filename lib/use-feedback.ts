import { toast } from "sonner";
import { ApiClientError } from "@/types/api";

function getErrorDescription(error: unknown, fallback?: string) {
  if (error instanceof ApiClientError) {
    const requestId = error.meta?.request_id;
    return requestId ? `${error.message} · Request ID: ${requestId}` : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function useFeedback() {
  return {
    success: (title: string, description?: string) => {
      toast.success(title, { description });
    },
    error: (title: string, error: unknown, fallback?: string) => {
      toast.error(title, {
        description: getErrorDescription(error, fallback),
      });
    },
  };
}