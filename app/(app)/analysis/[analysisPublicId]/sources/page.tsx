import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AnalysisSourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sources"
        description="Evidence source table dan data state dasar akan dirender di halaman ini pada module berikutnya."
      />
      <EmptyState />
    </div>
  );
}
