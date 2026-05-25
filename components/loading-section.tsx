import { Loader2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function PageSkeleton({ description = true }: { description?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        {description ? <Skeleton className="h-4 w-80" /> : null}
      </div>
    </div>
  );
}

function CardsSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border p-8 space-y-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function ContentSkeleton({ height = "h-56" }: { height?: string }) {
  return <Skeleton className={`w-full ${height}`} />;
}

function InlineSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function ButtonSpinner({ label = "Processing..." }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2Icon className="size-4 animate-spin" />
      {label}
    </span>
  );
}



function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export const LoadingSection = {
  Page: PageSkeleton,
  Cards: CardsSkeleton,
  Table: TableSkeleton,
  Content: ContentSkeleton,
  Inline: InlineSpinner,
  Button: ButtonSpinner,
  Report: ReportSkeleton,
};