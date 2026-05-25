"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import { useAdminUsageQuery } from "@/hooks/use-admin";
import { PageHeader } from "@/components/page-header";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const COLORS = ["#6366f1", "#84cc16", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function UsageAdminClient() {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

  const [startDate, setStartDate] = React.useState(thirtyDaysAgo);
  const [endDate, setEndDate] = React.useState(today);
  const [queryParams, setQueryParams] = React.useState<{ start_date?: string; end_date?: string }>({});

  const { data, isLoading, error } = useAdminUsageQuery(
    Object.keys(queryParams).length > 0 ? queryParams : undefined
  );

  function handleSearch() {
    setQueryParams({
      start_date: startDate ? startDate + "T00:00:00" : undefined,
      end_date: endDate ? endDate + "T23:59:59" : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Usage Analytics" description="Pantau konsumsi token, biaya LLM, dan performa query Tavily." />

      <Card>
        <CardHeader><CardTitle>Date Range</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" />
            </div>
            <Button onClick={handleSearch}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSection.Cards columns={4} />
      ) : error ? (
        <ErrorCard title="Gagal memuat usage analytics" error={error} />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{data.summary.total_runs}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{data.summary.total_tokens.toLocaleString()}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">LLM Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">${data.summary.total_llm_cost_usd.toFixed(4)}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">${data.summary.total_cost_usd.toFixed(4)}</div></CardContent></Card>
          </div>

          {data.charts.daily_trend.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Daily Trend</CardTitle></CardHeader>
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
            {data.charts.model_breakdown.length > 0 && (
              <Card><CardHeader><CardTitle>Model Breakdown</CardTitle></CardHeader>
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
            {data.charts.task_breakdown.length > 0 && (
              <Card><CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Top Records</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Highest Token Run</p>
                  <p className="mt-1 text-sm font-medium">{data.top_records?.highest_token_run?.company_name ?? "-"}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>{data.top_records?.highest_token_run?.total_tokens?.toLocaleString() ?? "0"} tokens</span>
                    <span>${data.top_records?.highest_token_run?.total_cost_usd?.toFixed(4) ?? "0.0000"}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Highest Cost Run</p>
                  <p className="mt-1 text-sm font-medium">{data.top_records?.highest_cost_run?.company_name ?? "-"}</p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>{data.top_records?.highest_cost_run?.total_tokens?.toLocaleString() ?? "0"} tokens</span>
                    <span>${data.top_records?.highest_cost_run?.total_cost_usd?.toFixed(4) ?? "0.0000"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.runs_table.length > 0 && (
            <Card>
              <CardHeader><CardTitle>All Runs</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead>
                      <TableHead className="text-right">Tokens</TableHead><TableHead className="text-right">Queries</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.runs_table.map((run) => (
                      <TableRow key={run.analysis_public_id}>
                        <TableCell><Link href={"/analysis/" + run.analysis_public_id} className="font-medium text-primary hover:underline">{run.company_name}</Link></TableCell>
                        <TableCell className="text-muted-foreground">{run.owner_email}</TableCell>
                        <TableCell><Badge variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}>{run.status}</Badge></TableCell>
                        <TableCell className="text-right">{run.total_tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{run.tavily_queries}</TableCell>
                        <TableCell className="text-right">${run.total_cost_usd.toFixed(4)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(run.created_at), "MMM dd, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
