import { PageHeader } from "@/components/page-header";
import { AnalysisRequestForm } from "./analysis-request-form";

export default function NewAnalysisPage() {
  return (
    <div className="space-y-6 w-full mx-auto">
      <PageHeader
        title="Analisis Baru"
        description="Ajukan permintaan analisis perusahaan baru. Lengkapi detail yang dibutuhkan agar AI dapat melakukan riset mendalam."
      />
      <div className="rounded-2xl border border-border/70 bg-card p-1 shadow-xl shadow-primary/5">
        <div className="rounded-xl bg-background/50 p-6 md:p-8">
          <AnalysisRequestForm />
        </div>
      </div>
    </div>
  );
}
