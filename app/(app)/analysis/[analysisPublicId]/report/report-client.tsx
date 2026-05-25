"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeftIcon, DatabaseIcon } from "lucide-react";
import { useAnalysisReportQuery } from "@/hooks/use-analysis";
import { ApiClientError } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { NotFoundState } from "@/components/states";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MarkdownRenderer = dynamic(() => import("@/components/markdown-renderer"), {
  ssr: false,
  loading: () => <LoadingSection.Content height="h-[600px]" />,
});

function hasText(value?: string | null) {
  return Boolean(value && typeof value === "string" && value.trim() && !["n/a", "na"].includes(value.trim().toLowerCase()));
}

export function AnalysisReportClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisReportQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSection.Page />
        <LoadingSection.Content height="h-[640px]" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.code === "ANALYSIS_NOT_FOUND") {
      return (
        <div className="space-y-6">
          <PageHeader title="Analysis Report" />
          <NotFoundState />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PageHeader title="Analysis Report" />
        <ErrorCard title="Error loading report" error={error} />
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
