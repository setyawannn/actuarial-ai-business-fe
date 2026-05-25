import { AlertTriangleIcon } from "lucide-react";

interface ChartFallbackProps {
  reason: string;
}

export function ChartFallback({ reason }: ChartFallbackProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm">
      <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div className="space-y-1">
        <p className="font-medium text-amber-700 dark:text-amber-400">Data Terbatas</p>
        <p className="text-amber-600/80 dark:text-amber-500/80">{reason}</p>
      </div>
    </div>
  );
}
