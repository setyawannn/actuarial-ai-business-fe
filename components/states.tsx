import { AlertCircleIcon, FileSearchIcon, LockIcon, SearchSlashIcon } from "lucide-react";

function BaseState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10">
      <div className="max-w-md space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm">
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <BaseState
      title="Loading content"
      description="Area ini sudah siap dipakai. Data state dan integrasi API akan masuk di module berikutnya."
      icon={<SearchSlashIcon className="size-5" />}
    />
  );
}

export function EmptyState() {
  return (
    <BaseState
      title="No data yet"
      description="UI state kosong sudah tersedia supaya nanti halaman tetap rapi saat belum ada hasil atau aktivitas."
      icon={<FileSearchIcon className="size-5" />}
    />
  );
}

export function ErrorState() {
  return (
    <BaseState
      title="Something went wrong"
      description="State error dasar sudah disiapkan untuk dipakai lintas halaman saat integrasi API dimulai."
      icon={<AlertCircleIcon className="size-5" />}
    />
  );
}

export function UnauthorizedState() {
  return (
    <BaseState
      title="Unauthorized"
      description="Area ini akan diproteksi penuh saat module auth selesai. Untuk sekarang, wrapper dan state tampilannya sudah siap."
      icon={<LockIcon className="size-5" />}
    />
  );
}

export function NotFoundState() {
  return (
    <BaseState
      title="Not found"
      description="State not found sudah tersedia untuk dipakai pada halaman detail, report, dan sources."
      icon={<FileSearchIcon className="size-5" />}
    />
  );
}
