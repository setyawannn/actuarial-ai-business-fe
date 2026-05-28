"use client";

import * as React from "react";
import { useAnalysisHistoryQuery } from "@/hooks/use-analysis";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const ITEMS_PER_PAGE = 10;

export function AnalysisHistoryClient() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: queryData, isLoading, error } = useAnalysisHistoryQuery({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });

  const runs = queryData?.data ?? [];
  const meta = queryData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalRuns = meta?.total ?? 0;

  // Reset to page 1 on filter/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

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

  if (!runs || runs.length === 0 && !debouncedSearch && statusFilter === "all") {
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
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Analysis History"
          description={`Menampilkan ${runs.length} dari ${totalRuns} riwayat analisis Anda.`}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Cari perusahaan, ID analisis, atau tujuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card"
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running / Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(searchTerm || statusFilter !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="px-3"
          >
            Reset
          </Button>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground border rounded-lg border-dashed bg-card">
          Tidak ada riwayat analisis yang sesuai dengan pencarian atau filter Anda.
        </div>
      ) : (
        <>
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
                {runs.map((run) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-2">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        text="Sebelumnya"
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isAdjacent = Math.abs(page - currentPage) <= 1;
                    const isFirstOrLast = page === 1 || page === totalPages;

                    if (isFirstOrLast || isAdjacent) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        text="Berikutnya"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

