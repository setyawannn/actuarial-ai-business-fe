import { AnalysisDetailClient } from "./analysis-detail-client";

export default async function AnalysisDetailPage({ 
  params 
}: { 
  params: Promise<{ analysisPublicId: string }> 
}) {
  const { analysisPublicId } = await params;

  return (
    <div className="space-y-6">
      <AnalysisDetailClient publicId={analysisPublicId} />
    </div>
  );
}
