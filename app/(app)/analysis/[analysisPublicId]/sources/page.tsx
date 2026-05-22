import { SourcesClient } from "./sources-client";

export default async function AnalysisSourcesPage({
  params,
}: {
  params: Promise<{ analysisPublicId: string }>;
}) {
  const { analysisPublicId } = await params;

  return <SourcesClient publicId={analysisPublicId} />;
}
