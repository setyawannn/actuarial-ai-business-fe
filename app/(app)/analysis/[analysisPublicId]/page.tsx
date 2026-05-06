import { NotFoundState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AnalysisDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis Detail"
        description="Overview detail analysis akan menggunakan shell yang sama dengan dashboard dan history."
      />
      <NotFoundState />
    </div>
  );
}
