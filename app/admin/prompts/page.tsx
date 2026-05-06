import { LoadingState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AdminPromptsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompts"
        description="Workspace prompt admin sudah disiapkan di dalam shell yang sama dengan area aplikasi utama."
      />
      <LoadingState />
    </div>
  );
}
