import { LoadingState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AnalysisReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Report"
        description="Reader markdown akan dipasang di area ini dengan top navigation dan state layout yang konsisten."
      />
      <LoadingState />
    </div>
  );
}
