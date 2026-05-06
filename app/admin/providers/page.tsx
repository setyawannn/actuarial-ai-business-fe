import { LoadingState } from "@/components/states";
import { PageHeader } from "@/components/page-header";

export default function AdminProvidersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Providers"
        description="Provider admin area sudah siap menerima konfigurasi, credential, dan status provider pada module admin."
      />
      <LoadingState />
    </div>
  );
}
