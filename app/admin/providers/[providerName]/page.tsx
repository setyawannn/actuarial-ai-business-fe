import { ProviderDetailClient } from "./provider-detail-client";

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ providerName: string }>;
}) {
  const { providerName } = await params;

  return <ProviderDetailClient providerName={decodeURIComponent(providerName)} />;
}
