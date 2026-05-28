"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeftIcon, DatabaseIcon } from "lucide-react";
import { useAdminRunAuditQuery } from "@/hooks/use-admin";
import { PageHeader } from "@/components/page-header";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminRunAuditClient({ analysisPublicId }: { analysisPublicId: string }) {
  const { data, isLoading, error } = useAdminRunAuditQuery(analysisPublicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSection.Page />
        <LoadingSection.Cards columns={4} />
        <LoadingSection.Content height="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit Trace" />
        <ErrorCard title="Error loading audit trace" error={error} />
      </div>
    );
  }

  if (!data) return null;

  const { run_metadata, summary, llm_calls_trace, tavily_queries } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeader
          title={`Audit Trace: ${run_metadata.company_name}`}
          description={`Analysis Goal: ${run_metadata.analysis_goal.replace(/_/g, " ")} | Owner: ${run_metadata.owner_email}`}
        />
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/usage">
              <ArrowLeftIcon className="mr-2 size-4" />
              Back to Usage
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={run_metadata.status === "completed" ? "default" : run_metadata.status === "failed" ? "destructive" : "secondary"}>
          {run_metadata.status}
        </Badge>
        {run_metadata.completed_at && (
          <Badge variant="outline">
            Completed: {format(new Date(run_metadata.completed_at), "PPp")}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total LLM Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.total_llm_calls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.total_tokens.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latency (ms)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.total_latency_ms.toLocaleString()} ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">${summary.total_cost_usd.toFixed(4)}</div>
          </CardContent>
        </Card>
      </div>

      {llm_calls_trace && llm_calls_trace.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>LLM Calls Trace</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Model / Provider</TableHead>
                  <TableHead>Input Keys</TableHead>
                  <TableHead className="text-right">Tokens (P/C)</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Cost (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {llm_calls_trace.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.task_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{call.model_name}</span>
                        <span className="text-xs text-muted-foreground">{call.provider}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {call.input_variables_keys.map((key) => (
                          <Badge key={key} variant="secondary" className="text-[10px]">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {call.total_tokens.toLocaleString()}
                      <span className="block text-xs text-muted-foreground">
                        {call.prompt_tokens} / {call.completion_tokens}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{(call.latency_ms / 1000).toFixed(1)}s</TableCell>
                    <TableCell className="text-right">${call.cost_usd.toFixed(6)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tavily_queries && tavily_queries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon className="size-4" />
              Tavily Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {tavily_queries.map((q, index) => {
                const queryText = typeof q === "string" ? q : q.query;
                const purpose = typeof q === "string" ? undefined : q.purpose;
                const priority = typeof q === "string" ? undefined : q.priority;
                return (
                  <li key={index} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground">{queryText}</span>
                      {priority && (
                        <Badge variant={priority === "high" ? "destructive" : "secondary"} className="text-[10px]">
                          {priority}
                        </Badge>
                      )}
                    </div>
                    {purpose && <p className="mt-1 text-xs">{purpose}</p>}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
