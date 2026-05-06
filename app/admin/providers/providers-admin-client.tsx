"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  PlusIcon,
  ServerCogIcon,
} from "lucide-react";
import {
  useCreateProviderConfigMutation,
  useProviderConfigsQuery,
  useProviderCredentialsQuery,
} from "@/hooks/use-admin";
import { ApiClientError } from "@/types/api";
import { buildProviderSummaries } from "@/lib/admin-providers";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import { PageHeader } from "@/components/page-header";
import { InfoTooltip } from "@/components/info-tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

function parseJsonOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as Record<string, unknown>;
}

function PageErrorCard({ error }: { error: Error }) {
  const requestId = error instanceof ApiClientError ? error.meta?.request_id : undefined;

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
      <p className="font-medium">Provider data belum bisa dimuat</p>
      <p className="mt-1 text-sm">{error.message}</p>
      {requestId ? <p className="mt-2 font-mono text-xs opacity-80">Request ID: {requestId}</p> : null}
    </div>
  );
}

function ProviderCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ReturnType<typeof buildProviderSummaries>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="outline">{items.length}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {items.length ? (
          items.map((provider) => (
            <div key={provider.providerName} className="rounded-xl border border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{provider.providerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.providerType} | {provider.environments.map((item) => item.environment).join(", ")}
                  </p>
                </div>
                <Badge variant={provider.isReady ? "default" : "secondary"}>
                  {provider.isReady ? "Ready" : "Needs attention"}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{provider.helperText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.environments.map((environment) => (
                  <Badge key={`${provider.providerName}-${environment.environment}`} variant="outline">
                    {environment.environment}: {environment.isReady ? "ready" : "not ready"}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild size="sm">
                  <Link href={`/admin/providers/${encodeURIComponent(provider.providerName)}`}>
                    Open
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
            Belum ada provider di kategori ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProvidersAdminClient() {
  const router = useRouter();
  const configsQuery = useProviderConfigsQuery();
  const credentialsQuery = useProviderCredentialsQuery();
  const createConfig = useCreateProviderConfigMutation();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [configForm, setConfigForm] = React.useState({
    provider_name: "",
    provider_type: "llm",
    is_enabled: "true",
    priority: "1",
    default_model: "",
    environment: "production",
    config: "",
  });

  const providers = React.useMemo(
    () => buildProviderSummaries(configsQuery.data ?? [], credentialsQuery.data ?? []),
    [configsQuery.data, credentialsQuery.data]
  );
  const activeProviders = providers.filter((provider) => provider.isReady);
  const needsAttentionProviders = providers.filter((provider) => provider.needsAttention);

  async function submitConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const created = await createConfig.mutateAsync({
        provider_name: configForm.provider_name.trim(),
        provider_type: configForm.provider_type.trim(),
        is_enabled: configForm.is_enabled === "true",
        priority: Number(configForm.priority || "1"),
        default_model: configForm.default_model.trim() || null,
        environment: configForm.environment.trim(),
        config: parseJsonOrNull(configForm.config),
      });

      showAdminSuccess("Provider config created", "Langkah berikutnya: tambahkan credential aktif.");
      setConfigForm({
        provider_name: "",
        provider_type: "llm",
        is_enabled: "true",
        priority: "1",
        default_model: "",
        environment: "production",
        config: "",
      });
      setIsCreateOpen(false);

      if (created.provider_name) {
        router.push(`/admin/providers/${encodeURIComponent(created.provider_name)}`);
      }
    } catch (error) {
      showAdminError("Failed to create provider config", error);
    }
  }

  const queryError = configsQuery.error ?? credentialsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Providers"
        description="Kelola provider runtime dengan flow yang jelas: cek readiness di sini, lalu buka satu provider untuk setup config dan credential."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Add Provider
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline">Ready {activeProviders.length}</Badge>
          <Badge variant="outline">Needs attention {needsAttentionProviders.length}</Badge>
          <Badge variant="outline">Total {providers.length}</Badge>
        </div>
      </PageHeader>

      {queryError ? <PageErrorCard error={queryError} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4" />
            Readiness Overview
            <InfoTooltip content="Provider dianggap ready bila punya config yang enabled dan minimal satu credential aktif pada environment yang sama." />
          </CardTitle>
          <CardDescription>
            Halaman ini hanya untuk orientasi. Semua setup dan perubahan detail dilakukan di halaman provider masing-masing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm text-muted-foreground">Active providers</p>
            <p className="mt-2 text-2xl font-semibold">{activeProviders.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sudah punya config dan credential aktif.</p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm text-muted-foreground">Needs attention</p>
            <p className="mt-2 text-2xl font-semibold">{needsAttentionProviders.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Butuh config atau credential aktif sebelum bisa dipakai.</p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm text-muted-foreground">Credentials tracked</p>
            <p className="mt-2 text-2xl font-semibold">{credentialsQuery.data?.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Nilai penuh credential tidak pernah ditampilkan ulang di UI.</p>
          </div>
        </CardContent>
      </Card>

      <ProviderCard
        title="Active Providers"
        description="Provider yang sudah siap dipakai untuk runtime."
        items={activeProviders}
      />

      <ProviderCard
        title="Needs Attention"
        description="Provider yang belum siap. Ikuti helper text untuk tahu harus mulai dari mana."
        items={needsAttentionProviders}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerCogIcon className="size-4" />
            All Providers
          </CardTitle>
          <CardDescription>
            Satu baris mewakili satu provider. Gunakan tombol <span className="font-medium text-foreground">Open</span> untuk masuk ke halaman kelola yang lebih fokus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Environments
                      <InfoTooltip content="Environment membantu memisahkan konfigurasi seperti production, staging, atau sandbox." />
                    </span>
                  </TableHead>
                  <TableHead>Config</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Active credentials
                      <InfoTooltip content="Credential aktif adalah secret yang masih bisa dipakai runtime untuk provider ini." />
                    </span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.providerName}>
                    <TableCell className="font-medium">{provider.providerName}</TableCell>
                    <TableCell>{provider.environments.map((item) => item.environment).join(", ")}</TableCell>
                    <TableCell>{provider.configCount}</TableCell>
                    <TableCell>{provider.activeCredentialCount}</TableCell>
                    <TableCell>
                      <Badge variant={provider.isReady ? "default" : "secondary"}>
                        {provider.isReady ? "Ready" : "Needs attention"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/providers/${encodeURIComponent(provider.providerName)}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
              Belum ada provider. Mulai dari tombol <span className="font-medium text-foreground">Add Provider</span>.
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Add Provider</SheetTitle>
            <SheetDescription>
              Mulai dari runtime configuration dulu. Setelah tersimpan, lanjut tambahkan credential aktif di halaman provider tersebut.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitConfig}>
            <div className="flex-1 space-y-4 px-4 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Provider Name</FieldLabel>
                  <Input
                    value={configForm.provider_name}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, provider_name: event.target.value }))
                    }
                    placeholder="openai"
                  />
                </Field>
                <Field>
                  <FieldLabel>Provider Type</FieldLabel>
                  <Input
                    value={configForm.provider_type}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, provider_type: event.target.value }))
                    }
                    placeholder="llm"
                  />
                </Field>
                <Field>
                  <FieldLabel className="inline-flex items-center gap-1">
                    Environment
                    <InfoTooltip content="Biasanya production, staging, atau sandbox." />
                  </FieldLabel>
                  <Input
                    value={configForm.environment}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, environment: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel className="inline-flex items-center gap-1">
                    Default Model
                    <InfoTooltip content="Model utama yang akan dipakai bila backend tidak memilih model lain secara eksplisit." />
                  </FieldLabel>
                  <Input
                    value={configForm.default_model}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, default_model: event.target.value }))
                    }
                    placeholder="gpt-5.5"
                  />
                </Field>
                <Field>
                  <FieldLabel className="inline-flex items-center gap-1">
                    Priority
                    <InfoTooltip content="Angka lebih kecil biasanya dibaca lebih prioritas, tergantung aturan backend." />
                  </FieldLabel>
                  <Input
                    type="number"
                    value={configForm.priority}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, priority: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Enabled</FieldLabel>
                  <Input
                    value={configForm.is_enabled}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, is_enabled: event.target.value }))
                    }
                    placeholder="true"
                  />
                  <FieldDescription>Isi `true` bila config ini langsung boleh dipakai runtime.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Config JSON</FieldLabel>
                  <Textarea
                    value={configForm.config}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, config: event.target.value }))
                    }
                    placeholder='{"base_url":"https://api.example.com"}'
                  />
                  <FieldDescription>Kosongkan bila provider tidak butuh konfigurasi tambahan.</FieldDescription>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createConfig.isPending}>
                {createConfig.isPending ? "Saving..." : "Save and continue"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
