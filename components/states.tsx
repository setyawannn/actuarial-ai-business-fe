import { AlertCircleIcon, FileQuestionIcon, FileSearchIcon, LockIcon } from "lucide-react";

function BaseState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="group flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 px-6 py-10 transition-colors hover:border-border/80 hover:bg-muted/40">
      <div className="max-w-md space-y-5 text-center">
        <div className="relative mx-auto flex size-16 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5 transition-all duration-500 group-hover:bg-primary/10"></div>
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110 group-hover:text-foreground">
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {action && <div className="pt-2 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ 
  title = "Belum Ada Data", 
  description = "Saat ini belum ada data atau aktivitas yang dapat ditampilkan di halaman ini.", 
  action 
}: { 
  title?: string; 
  description?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <BaseState
      title={title}
      description={description}
      icon={<FileSearchIcon className="size-6" />}
      action={action}
    />
  );
}

export function ErrorState({ 
  title = "Terjadi Kesalahan", 
  description = "Sistem mengalami kendala teknis saat mencoba memuat halaman ini. Silakan coba kembali beberapa saat lagi.", 
  action 
}: { 
  title?: string; 
  description?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <BaseState
      title={title}
      description={description}
      icon={<AlertCircleIcon className="size-6 text-destructive/80" />}
      action={action}
    />
  );
}

export function UnauthorizedState({ 
  title = "Akses Ditolak", 
  description = "Maaf, Anda tidak memiliki hak akses (izin) yang cukup untuk melihat atau mengubah konten pada halaman ini.", 
  action 
}: { 
  title?: string; 
  description?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <BaseState
      title={title}
      description={description}
      icon={<LockIcon className="size-6" />}
      action={action}
    />
  );
}

export function NotFoundState({ 
  title = "Halaman Tidak Ditemukan", 
  description = "Informasi atau data yang Anda cari tidak dapat ditemukan. Mungkin telah dihapus, dipindahkan, atau Anda salah memasukkan URL.", 
  action 
}: { 
  title?: string; 
  description?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <BaseState
      title={title}
      description={description}
      icon={<FileQuestionIcon className="size-6" />}
      action={action}
    />
  );
}

