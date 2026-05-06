import { LockKeyholeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/70 bg-background p-8 shadow-sm">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyholeIcon className="size-5" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Halaman login dibuat bersih tanpa shell aplikasi. Form auth dan session flow akan
              dihubungkan pada module berikutnya.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>Email, password, dan auth session belum dihubungkan pada tahap ini.</p>
          <p>Tujuan module ini adalah menyiapkan layout dan experience dasar area auth.</p>
        </div>

        <Button className="w-full" disabled>
          Auth Module Next
        </Button>
      </div>
    </main>
  );
}
