import { PromptTemplateDetailClient } from "./prompt-template-detail-client";

export default async function AdminPromptTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;

  return <PromptTemplateDetailClient templateId={templateId} />;
}
