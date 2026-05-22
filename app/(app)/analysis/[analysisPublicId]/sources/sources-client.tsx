"use client";

import Link from "next/link";
import { DatabaseIcon, ExternalLinkIcon, FileTextIcon, ShieldAlertIcon } from "lucide-react";
import { useAnalysisSourcesQuery } from "@/hooks/use-analysis";
import { ApiClientError, AnalysisDataGap, AnalysisSource } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState, NotFoundState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function hasText(value?: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "" && normalized !== "n/a" && normalized !== "na" && normalized !== "unknown";
}

function cleanSources(sources: AnalysisSource[]) {
  return sources.filter(
    (source) =>
      hasText(source.title) ||
      hasText(source.domain) ||
      hasText(source.source_type) ||
      hasText(source.raw_snippet) ||
      hasText(source.url)
  );
}

function cleanDataGaps(dataGaps: AnalysisDataGap[]) {
  return dataGaps.filter(
    (gap) =>
      hasText(gap.missing_item) ||
      hasText(gap.importance) ||
      hasText(gap.reason) ||
      hasText(gap.recommended_action)
  );
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return Number.isFinite(value) ? Math.round(value) : null;
}

function formatRelevance(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
}

export function SourcesClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisSourcesQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.code === "ANALYSIS_NOT_FOUND") {
      return <NotFoundState />;
    }

    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">
        <p className="font-medium">Error loading sources</p>
        <p className="text-sm">{error.message}</p>
        {error instanceof ApiClientError && error.meta?.request_id ? (
          <p className="mt-2 font-mono text-xs">Request ID: {error.meta.request_id}</p>
        ) : null}
      </div>
    );
  }

  if (!data) return null;

  const sources = cleanSources(data.sources ?? []);
  const dataGaps = cleanDataGaps(data.data_gaps ?? []);
  const summary = data.report_summary ?? null;
  const hasAnyContent = sources.length > 0 || dataGaps.length > 0;

  if (!hasAnyContent) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sources"
          description="Belum ada evidence source atau data gap yang bisa ditampilkan untuk analysis ini."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}`}>
                <FileTextIcon className="mr-2 size-4" />
                Back to Overview
              </Link>
            </Button>
          }
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sources"
        description={
          hasText(summary?.company_name)
            ? `Evidence dan data gaps untuk ${summary?.company_name}.`
            : "Evidence dan data gaps untuk analysis ini."
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}`}>
                <FileTextIcon className="mr-2 size-4" />
                Overview
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}/report`}>
                <DatabaseIcon className="mr-2 size-4" />
                Full Report
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {summary?.analysis_goal ? (
            <Badge variant="outline">{summary.analysis_goal.replaceAll("_", " ")}</Badge>
          ) : null}
          <Badge variant="outline">{sources.length} sources</Badge>
          {dataGaps.length > 0 ? <Badge variant="outline">{dataGaps.length} data gaps</Badge> : null}
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evidence Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{sources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{dataGaps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary?.data_confidence || data.status}</div>
          </CardContent>
        </Card>
      </div>

      {sources.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Sources</CardTitle>
            <CardDescription>
              Sumber yang dipakai backend untuk membentuk analisis. Relevance dan credibility ditampilkan bila backend menyediakannya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sources.map((source, index) => (
                <div
                  key={`${source.url}-${index}`}
                  className="rounded-2xl border border-border/70 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.6fr)]">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        {hasText(source.title) ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1 font-medium text-foreground transition hover:text-primary"
                          >
                            <span className="break-words">{source.title}</span>
                            <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0" />
                          </a>
                        ) : (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1 font-medium text-foreground transition hover:text-primary"
                          >
                            <span className="break-all">{source.url}</span>
                            <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0" />
                          </a>
                        )}
                        {hasText(source.domain) ? (
                          <p className="text-sm text-muted-foreground">{source.domain}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hasText(source.source_type) ? (
                          <Badge variant="secondary">{source.source_type}</Badge>
                        ) : null}
                        {formatScore(source.credibility_score) !== null ? (
                          <Badge variant="outline">
                            Credibility {formatScore(source.credibility_score)}
                          </Badge>
                        ) : null}
                        {formatRelevance(source.relevance_score) ? (
                          <Badge variant="outline">
                            Relevance {formatRelevance(source.relevance_score)}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Snippet
                      </p>
                      <div className="rounded-xl bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">
                        {hasText(source.raw_snippet) ? source.raw_snippet : "Snippet tidak tersedia untuk source ini."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {dataGaps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlertIcon className="size-4" />
              Data Gaps
            </CardTitle>
            <CardDescription>
              Area ini menjelaskan data yang belum tersedia dan apa dampaknya ke kualitas analisis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Missing Item</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Recommended Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataGaps.map((gap, index) => (
                  <TableRow key={`${gap.missing_item}-${index}`}>
                    <TableCell className="whitespace-normal font-medium">{gap.missing_item}</TableCell>
                    <TableCell className="whitespace-normal">
                      {hasText(gap.importance) ? <Badge variant="outline">{gap.importance}</Badge> : "-"}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {hasText(gap.reason) ? gap.reason : "-"}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {hasText(gap.recommended_action) ? gap.recommended_action : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
