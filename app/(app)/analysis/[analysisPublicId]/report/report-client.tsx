"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeftIcon, DatabaseIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { useAnalysisReportQuery } from "@/hooks/use-analysis";
import { ApiClientError } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { NotFoundState } from "@/components/states";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const MarkdownRenderer = dynamic(() => import("@/components/markdown-renderer"), {
  ssr: false,
  loading: () => <LoadingSection.Content height="h-[600px]" />,
});

function hasText(value?: string | null) {
  return Boolean(value && typeof value === "string" && value.trim() && !["n/a", "na"].includes(value.trim().toLowerCase()));
}

export function AnalysisReportClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisReportQuery(publicId);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPdf() {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/analysis/runs/${publicId}/export-pdf`);
      if (!res.ok) {
        throw new Error("Failed to export PDF");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      let filename = `Analysis_Report_${publicId}.pdf`;
      const disposition = res.headers.get("Content-Disposition");
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export PDF error:", err);
      toast.error("Gagal mengunduh PDF");
    } finally {
      setIsExporting(false);
    }
  }

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
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageHeader title={title} description={description} />

        <div className="flex flex-wrap gap-2 shrink-0">
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
          <Button onClick={handleExportPdf} disabled={isExporting} size="sm">
            {isExporting ? <Spinner className="mr-2 size-4" /> : <DownloadIcon className="mr-2 size-4" />}
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-full overflow-hidden">
        <CardContent className="w-full max-w-full overflow-x-auto p-6 md:p-8">
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
