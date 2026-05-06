import { PageHeader } from "@/components/page-header";
import { AnalysisRequestForm } from "./analysis-request-form";

export default function NewAnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Analysis"
        description="Submit a new company analysis request. Fill out the required details to begin the process."
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <AnalysisRequestForm />
      </div>
    </div>
  );
}
