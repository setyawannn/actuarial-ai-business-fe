"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import { useAdminUsageQuery, useAdminRunsTableQuery } from "@/hooks/use-admin";
import { PageHeader } from "@/components/page-header";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
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
import { format } from "date-fns";

const COLORS = ["#6366f1", "#84cc16", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const ITEMS_PER_PAGE = 10;

export function UsageAdminClient() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  
  // Local form state for search & status
  const [searchInput, setSearchInput] = React.useState("");
  const [statusInput, setStatusInput] = React.useState("all");

  // Applied filters (what gets sent to the API)
  const [appliedFilters, setAppliedFilters] = React.useState<{
    start_date?: string;
    end_date?: string;
    search?: string;
    status: string;
  }>({ status: "all" });

  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, error } = useAdminUsageQuery({
    start_date: appliedFilters.start_date,
    end_date: appliedFilters.end_date,
    search: appliedFilters.search,
    status: appliedFilters.status,
  });

  const { data: runsData, isLoading: isRunsLoading, error: runsError } = useAdminRunsTableQuery({
    start_date: appliedFilters.start_date,
    end_date: appliedFilters.end_date,
    search: appliedFilters.search,
    status: appliedFilters.status,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  // Reset to page 1 on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  function handleApplyFilters() {
    setAppliedFilters({
      start_date: startDate ? format(startDate, "yyyy-MM-dd") + "T00:00:00" : undefined,
      end_date: endDate ? format(endDate, "yyyy-MM-dd") + "T23:59:59" : undefined,
      search: searchInput || undefined,
      status: statusInput,
    });
  }

  function handleResetFilters() {
    setSearchInput("");
    setStatusInput("all");
    setAppliedFilters((prev) => ({ ...prev, search: undefined, status: "all" }));
  }

  const paginatedRuns = runsData?.data ?? [];
  const meta = runsData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalRuns = meta?.total ?? 0;
  
  const hasNoDataOverall = !appliedFilters.search && appliedFilters.status === "all" && totalRuns === 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Usage Analytics" description="Pantau konsumsi token, biaya LLM, dan performa query Tavily." />

      <Card>
        <CardHeader><CardTitle>Filter Usage & Runs</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col space-y-1.5 flex-1 min-w-[200px]">
                <Label>Pencarian</Label>
                <Input
                  placeholder="Cari perusahaan, email, atau ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1.5 w-[180px]">
                <Label>Status</Label>
                <Select value={statusInput} onValueChange={setStatusInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="running">Running / Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Tanggal Mulai</Label>
                <DatePicker date={startDate} setDate={setStartDate} className="w-[180px]" placeholder="Pilih tanggal mulai" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Tanggal Akhir</Label>
                <DatePicker date={endDate} setDate={setEndDate} className="w-[180px]" placeholder="Pilih tanggal akhir" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters}>Terapkan Filter</Button>
              {(searchInput || statusInput !== "all") && (
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading || isRunsLoading ? (
        <LoadingSection.Cards columns={4} />
      ) : error || runsError ? (
        <ErrorCard title="Gagal memuat usage analytics" error={(error || runsError) as Error} />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{data.summary?.total_runs ?? 0}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(data.summary?.total_tokens ?? 0).toLocaleString()}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">LLM Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">${(data.summary?.total_llm_cost_usd ?? 0).toFixed(4)}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">${(data.summary?.total_cost_usd ?? 0).toFixed(4)}</div></CardContent></Card>
          </div>

          {data.charts?.daily_trend && data.charts.daily_trend.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tren Harian</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.charts.daily_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" dataKey="cost_usd" name="Cost (USD)" stroke="#ef4444" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {data.charts?.model_breakdown && data.charts.model_breakdown.length > 0 && (
              <Card><CardHeader><CardTitle>Proporsi Model</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.charts.model_breakdown} cx="50%" cy="50%" outerRadius={70} dataKey="total_tokens" nameKey="model_name" label={(entry: any) => entry?.model_name?.split("/").pop() || ""}>
                          {data.charts.model_breakdown.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.charts?.task_breakdown && data.charts.task_breakdown.length > 0 && (
              <Card><CardHeader><CardTitle>Proporsi Tugas (Task)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.charts.task_breakdown} cx="50%" cy="50%" outerRadius={70} dataKey="total_tokens" nameKey="task_type" label={(entry: any) => entry?.task_type || ""}>
                          {data.charts.task_breakdown.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader><CardTitle>Catatan Tertinggi</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Run Token Tertinggi</p>
                  <p className="mt-1 text-sm font-medium">{data.top_records?.highest_token_run?.company_name ?? "-"}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>{(data.top_records?.highest_token_run?.total_tokens ?? 0).toLocaleString()} tokens</span>
                    <span>${(data.top_records?.highest_token_run?.total_cost_usd ?? 0).toFixed(4)}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Run Biaya Tertinggi</p>
                  <p className="mt-1 text-sm font-medium">{data.top_records?.highest_cost_run?.company_name ?? "-"}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>{(data.top_records?.highest_cost_run?.total_tokens ?? 0).toLocaleString()} tokens</span>
                    <span>${(data.top_records?.highest_cost_run?.total_cost_usd ?? 0).toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4 space-y-0">
              <CardTitle>Semua Analisis Run</CardTitle>
              <div className="text-xs text-muted-foreground">
                Menampilkan {paginatedRuns.length} dari {totalRuns} runs
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              {paginatedRuns.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground border rounded-lg border-dashed">
                  {hasNoDataOverall
                    ? "Belum ada riwayat analisis run yang tercatat."
                    : "Tidak ada run yang sesuai dengan pencarian atau filter Anda."}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Tokens</TableHead>
                          <TableHead className="text-right">Queries</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRuns.map((run) => (
                          <TableRow key={run.analysis_public_id}>
                            <TableCell>
                              <Link href={`/admin/usage/${run.analysis_public_id}`} className="font-medium text-primary hover:underline">
                                {run.company_name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{run.owner_email}</TableCell>
                            <TableCell>
                              <Badge variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}>
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{run.total_tokens?.toLocaleString() ?? "-"}</TableCell>
                            <TableCell className="text-right">{run.tavily_queries ?? "-"}</TableCell>
                            <TableCell className="text-right">{run.total_cost_usd != null ? `$${run.total_cost_usd.toFixed(4)}` : "-"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {run.created_at ? format(new Date(run.created_at), "MMM dd, yyyy") : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-2 border-t">
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
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

