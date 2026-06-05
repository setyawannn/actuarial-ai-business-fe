"use client";

import * as React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAnalysisDetailQuery } from "@/hooks/use-analysis";
import { ContextEvaluatorForm } from "@/components/loading-ux/context-evaluator-form";
import { PageHeader } from "@/components/page-header";
import { LoadingSection } from "@/components/loading-section";

export default function NeedContextPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const publicId = params.analysisPublicId as string;
  const companyName = searchParams.get("companyName") || "";

  const detailQuery = useAnalysisDetailQuery(publicId, {
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "needs_more_context") {
        return false;
      }
      return 3000;
    },
  });

  React.useEffect(() => {
    if (detailQuery.data && detailQuery.data.status !== "needs_more_context") {
      router.replace(`/analysis/${publicId}${companyName ? `?companyName=${encodeURIComponent(companyName)}` : ""}`);
    }
  }, [detailQuery.data?.status, publicId, router, companyName]);

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Memeriksa Status Analisis..." />
        <LoadingSection.Content height="h-64" />
      </div>
    );
  }

  if (detailQuery.data?.status !== "needs_more_context") {
    return (
      <div className="space-y-6">
        <PageHeader title="Mengarahkan..." />
        <LoadingSection.Content height="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      <PageHeader
        title="Klarifikasi Informasi Analisis"
        description="Lengkapi detail di bawah ini agar AI dapat memberikan hasil evaluasi risiko yang akurat."
      />
      <div className="rounded-2xl border border-border/70 bg-card p-1 shadow-xl shadow-primary/5">
        <div className="rounded-xl bg-background/50 p-1">
          <ContextEvaluatorForm
            publicId={publicId}
            questions={detailQuery.data.context_questions || []}
            onSuccess={() => {
              router.replace(`/analysis/${publicId}?new=true${companyName ? `&companyName=${encodeURIComponent(companyName)}` : ""}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
