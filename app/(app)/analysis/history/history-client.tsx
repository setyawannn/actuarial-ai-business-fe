"use client";

import { useAnalysisHistoryQuery } from "@/hooks/use-analysis";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
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

export function AnalysisHistoryClient() {
  const { data, isLoading, error } = useAnalysisHistoryQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis History"
          description="Memuat data riwayat analisis Anda..."
        />
        <LoadingSection.Table rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analysis History" />
        <ErrorCard title="Gagal memuat history" error={error} />
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
