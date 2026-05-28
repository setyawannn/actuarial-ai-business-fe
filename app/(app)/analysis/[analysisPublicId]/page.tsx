import { Suspense } from "react";
import { AnalysisDetailClient } from "./analysis-detail-client";
import { LoadingSection } from "@/components/loading-section";

export default async function AnalysisDetailPage({ 
  params 
}: { 
  params: Promise<{ analysisPublicId: string }> 
}) {
  const { analysisPublicId } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSection.Page />}>
        <AnalysisDetailClient publicId={analysisPublicId} />
      </Suspense>
    </div>
  );
}
