import { LoadingState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AnalysisHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description="Halaman history sudah berada di dalam shell yang konsisten dan siap menerima tabel caller-owned analysis runs."
      />
      <LoadingState />
    </div>
  );
}
