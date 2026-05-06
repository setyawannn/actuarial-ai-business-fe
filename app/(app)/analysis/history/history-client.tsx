"use client";

import { useAnalysisHistoryQuery } from "@/hooks/use-analysis";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { format } from "date-fns";
import { ApiClientError } from "@/types/api";

export function AnalysisHistoryClient() {
  const { data, isLoading, error } = useAnalysisHistoryQuery();
  const requestId = error instanceof ApiClientError ? error.meta?.request_id : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis History"
          description="Memuat data riwayat analisis Anda..."
        />
        <div className="rounded-md border p-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analysis History" />
        <div className="rounded-md bg-destructive/15 p-4 text-destructive border border-destructive/20 flex flex-col gap-2">
          <p className="font-medium">Gagal memuat history</p>
          <p className="text-sm">{error.message}</p>
          {requestId && (
            <p className="text-xs font-mono opacity-80 mt-2">
              Request ID: {requestId}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis History"
          description="Daftar analisis yang pernah Anda jalankan."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description={`Menampilkan ${data.length} riwayat analisis Anda.`}
      />

      <div className="rounded-md border overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((run) => (
              <TableRow key={run.analysis_public_id}>
                <TableCell className="font-medium">
                  {run.company_name || "Unknown Company"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {run.analysis_goal}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      run.status === "completed"
                        ? "default"
                        : run.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {run.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {run.created_at
                    ? format(new Date(run.created_at), "MMM d, yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/analysis/${run.analysis_public_id}`}>
                      View Detail <ArrowRightIcon className="ml-2 size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
