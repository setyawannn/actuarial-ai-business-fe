import { redirect } from "next/navigation";

export default async function AdminPromptTemplateEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  redirect(`/admin/prompts/${templateId}`);
}
