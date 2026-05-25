import { Skeleton } from "@/components/ui/skeleton";

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
