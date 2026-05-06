"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeftIcon, DatabaseIcon } from "lucide-react";
import { useAnalysisReportQuery } from "@/hooks/use-analysis";
import { ApiClientError } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { NotFoundState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MarkdownRenderer = dynamic(() => import("@/components/markdown-renderer"), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

function hasText(value?: string | null) {
  return Boolean(value && value.trim() && !["n/a", "na"].includes(value.trim().toLowerCase()));
}

export function AnalysisReportClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisReportQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-[640px] w-full" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.code === "ANALYSIS_NOT_FOUND") {
      return <NotFoundState />;
    }

    return (
      <div className="space-y-6">
        <PageHeader title="Analysis Report" />
        <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">
          <p className="font-medium">Error loading report</p>
          <p className="text-sm">{error.message}</p>
          {error instanceof ApiClientError && error.meta?.request_id ? (
            <p className="mt-2 text-xs font-mono opacity-80">Request ID: {error.meta.request_id}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const title = hasText(data.report_summary?.company_name)
    ? `${data.report_summary?.company_name} Report`
    : "Analysis Report";
  const description = hasText(data.report_summary?.analysis_goal)
    ? `Goal: ${data.report_summary?.analysis_goal.replaceAll("_", " ")}`
    : "Full generated analysis report";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeader title={title} description={description} />

        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/analysis/${publicId}`}>
              <ArrowLeftIcon className="mr-2 size-4" />
              Overview
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/analysis/${publicId}/sources`}>
              <DatabaseIcon className="mr-2 size-4" />
              Sources
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          {hasText(data.report_markdown) ? (
            <MarkdownRenderer content={data.report_markdown} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <p className="mb-2 text-lg font-medium">No report content</p>
              <p className="max-w-sm text-sm">
                Report belum memiliki konten yang cukup untuk ditampilkan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
