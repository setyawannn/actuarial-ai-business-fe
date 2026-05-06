import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function NewAnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Analysis"
        description="Layout halaman request analysis sudah siap. Form, schema, dan submit flow akan masuk pada module analysis request."
      />
      <EmptyState />
    </div>
  );
}
