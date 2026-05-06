import { AnalysisReportClient } from "./report-client";

export default async function AnalysisReportPage({ 
  params 
}: { 
  params: Promise<{ analysisPublicId: string }> 
}) {
  const { analysisPublicId } = await params;

  return <AnalysisReportClient publicId={analysisPublicId} />;
}
