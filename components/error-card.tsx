import { ApiClientError } from "@/types/api";
import { AlertCircleIcon } from "lucide-react";

export function ErrorCard({
  title,
  error,
  className,
}: {
  title: string;
  error: Error;
  className?: string;
}) {
  const requestId = error instanceof ApiClientError ? error.meta?.request_id : undefined;

  return (
    <div className={`rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm">{error.message}</p>
          {requestId ? (
            <p className="pt-1 font-mono text-xs opacity-80">Request ID: {requestId}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}