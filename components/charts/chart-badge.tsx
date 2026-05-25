import { Badge } from "@/components/ui/badge";

interface ChartBadgeProps {
  type: "ai-derived" | "source-backed" | "confidence";
  value?: number;
}

export function ChartBadge({ type, value }: ChartBadgeProps) {
  if (type === "ai-derived") {
    return (
      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
        AI-derived
      </Badge>
    );
  }
  if (type === "source-backed") {
    return (
      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        Source-backed
      </Badge>
    );
  }
  if (type === "confidence" && value !== undefined) {
    const color = value >= 70
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : value >= 40
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-red-500/10 text-red-600 dark:text-red-400";
    return (
      <Badge variant="secondary" className={`${color} border-current/20`}>
        Confidence: {value}%
      </Badge>
    );
  }
  return null;
}
