"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  PowerOffIcon,
  RefreshCwIcon,
  ServerCogIcon,
  Trash2Icon,
} from "lucide-react";
import {
  useCreateProviderConfigMutation,
  useCreateProviderCredentialMutation,
  useDeleteProviderConfigMutation,
  useDeleteProviderCredentialMutation,
  useDisableProviderCredentialMutation,
  useProviderConfigsQuery,
  useProviderCredentialsQuery,
  useRotateProviderCredentialMutation,
  useUpdateProviderConfigMutation,
} from "@/hooks/use-admin";
import { ApiClientError, ProviderConfig, ProviderCredential } from "@/types/api";
import { buildProviderSummaries, canRemoveCredential } from "@/lib/admin-providers";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import { InfoTooltip } from "@/components/info-tooltip";
import { NotFoundState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

type ConfirmState =
  | { kind: "delete-config"; config: ProviderConfig }
  | { kind: "disable-credential"; credential: ProviderCredential }
  | { kind: "delete-credential"; credential: ProviderCredential }
  | null;

function getConfirmCopy(state: Exclude<ConfirmState, null>) {
  if (state.kind === "delete-config") {
    return {
      title: "Delete this provider config?",
      description:
        "Config ini akan dihapus permanen. Provider bisa kehilangan readiness pada environment ini bila tidak ada config cadangan.",
      actionLabel: "Delete config",
    };
  }

  if (state.kind === "disable-credential") {
    return {
      title: "Disable this credential?",
      description:
        "Credential akan berhenti dipakai runtime. Bila ini credential aktif terakhir, provider bisa menjadi tidak ready.",
      actionLabel: "Disable credential",
    };
  }

  return {
    title: "Delete this credential?",
    description:
      "Credential akan dihapus permanen dari sistem. Pastikan masih ada credential aktif lain bila provider ini sedang dipakai.",
    actionLabel: "Delete credential",
  };
}

export function ProviderDetailClient({ providerName }: { providerName: string }) {
  const configsQuery = useProviderConfigsQuery();
  const credentialsQuery = useProviderCredentialsQuery();
  const createConfig = useCreateProviderConfigMutation();
  const updateConfig = useUpdateProviderConfigMutation();
  const deleteConfig = useDeleteProviderConfigMutation();
  const createCredential = useCreateProviderCredentialMutation();
  const rotateCredential = useRotateProviderCredentialMutation();
  const disableCredential = useDisableProviderCredentialMutation();
  const deleteCredential = useDeleteProviderCredentialMutation();

  const [editingConfig, setEditingConfig] = React.useState<ProviderConfig | null>(null);
  const [rotatingCredential, setRotatingCredential] = React.useState<ProviderCredential | null>(null);
  const [confirmState, setConfirmState] = React.useState<ConfirmState>(null);
  const [isConfigSheetOpen, setIsConfigSheetOpen] = React.useState(false);
  const [isCredentialSheetOpen, setIsCredentialSheetOpen] = React.useState(false);
  const [isRotateSheetOpen, setIsRotateSheetOpen] = React.useState(false);

  const [configForm, setConfigForm] = React.useState({
    provider_type: "llm",
    is_enabled: "true",
    priority: "1",
    default_model: "",
    environment: "production",
    config: "",
  });
  const [credentialForm, setCredentialForm] = React.useState({
    credential_name: "api_key",
    value: "",
    environment: "production",
    metadata_: "",
  });
  const [newCredentialValue, setNewCredentialValue] = React.useState("");

  const configs = React.useMemo(
    () => (configsQuery.data ?? []).filter((item) => item.provider_name === providerName),
    [configsQuery.data, providerName]
  );
  const credentials = React.useMemo(
    () => (credentialsQuery.data ?? []).filter((item) => item.provider_name === providerName),
    [credentialsQuery.data, providerName]
  );
  const allConfigs = configsQuery.data ?? [];
  const allCredentials = credentialsQuery.data ?? [];

  const providerSummary = React.useMemo(
    () => buildProviderSummaries(configs, credentials)[0] ?? null,
    [configs, credentials]
  );

  const queryError = configsQuery.error ?? credentialsQuery.error;
  const hasAnyData = configs.length > 0 || credentials.length > 0;

  function openCreateConfig(environment?: string) {
    setEditingConfig(null);
    setConfigForm({
      provider_type: configs[0]?.provider_type ?? "llm",
      is_enabled: "true",
      priority: "1",
      default_model: "",
      environment: environment ?? "production",
      config: "",
    });
    setIsConfigSheetOpen(true);
  }

  function openEditConfig(config: ProviderConfig) {
    setEditingConfig(config);
    setConfigForm({
      provider_type: config.provider_type,
      is_enabled: String(config.is_enabled),
      priority: String(config.priority),
      default_model: config.default_model ?? "",
      environment: config.environment,
      config: config.config ? JSON.stringify(config.config, null, 2) : "",
    });
    setIsConfigSheetOpen(true);
  }

  function openCreateCredential(environment?: string) {
    setCredentialForm({
      credential_name: "api_key",
      value: "",
      environment: environment ?? configs[0]?.environment ?? "production",
      metadata_: "",
    });
    setIsCredentialSheetOpen(true);
  }

  function openRotateCredential(credential: ProviderCredential) {
    setRotatingCredential(credential);
    setNewCredentialValue("");
    setIsRotateSheetOpen(true);
  }

  async function submitConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      is_enabled: configForm.is_enabled === "true",
      priority: Number(configForm.priority || "1"),
      default_model: configForm.default_model.trim() || null,
      config: parseJsonOrNull(configForm.config),
    };

    try {
      if (editingConfig) {
        await updateConfig.mutateAsync({
          configId: editingConfig.id,
          payload,
        });
        showAdminSuccess("Provider config updated");
      } else {
        await createConfig.mutateAsync({
          provider_name: providerName,
          provider_type: configForm.provider_type.trim(),
          environment: configForm.environment.trim(),
          ...payload,
        });
        showAdminSuccess("Provider config created");
      }

      setIsConfigSheetOpen(false);
      setEditingConfig(null);
    } catch (error) {
      showAdminError("Failed to save provider config", error);
    }
  }

  async function submitCredential(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createCredential.mutateAsync({
        provider_name: providerName,
        credential_name: credentialForm.credential_name.trim(),
        value: credentialForm.value,
        environment: credentialForm.environment.trim(),
        metadata_: parseJsonOrNull(credentialForm.metadata_),
      });
      showAdminSuccess("Credential created", "Provider sekarang bisa memakai secret baru ini setelah aktif.");
      setIsCredentialSheetOpen(false);
      setCredentialForm({
        credential_name: "api_key",
        value: "",
        environment: configs[0]?.environment ?? "production",
        metadata_: "",
      });
    } catch (error) {
      showAdminError("Failed to create credential", error);
    }
  }

  async function submitRotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rotatingCredential || !newCredentialValue.trim()) return;

    try {
      await rotateCredential.mutateAsync({
        credId: rotatingCredential.id,
        newValue: newCredentialValue,
      });
      showAdminSuccess("Credential rotated");
      setIsRotateSheetOpen(false);
      setRotatingCredential(null);
      setNewCredentialValue("");
    } catch (error) {
      showAdminError("Failed to rotate credential", error);
    }
  }

  async function runConfirmAction() {
    if (!confirmState) return;

    try {
      if (confirmState.kind === "delete-config") {
        await deleteConfig.mutateAsync(confirmState.config.id);
        showAdminSuccess("Provider config deleted");
      }

      if (confirmState.kind === "disable-credential") {
        await disableCredential.mutateAsync(confirmState.credential.id);
        showAdminSuccess("Credential disabled");
      }

      if (confirmState.kind === "delete-credential") {
        await deleteCredential.mutateAsync(confirmState.credential.id);
        showAdminSuccess("Credential deleted");
      }

      setConfirmState(null);
    } catch (error) {
      showAdminError("Action failed", error);
    }
  }

  if (queryError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={providerName}
          description="Kelola satu provider tanpa bercampur dengan provider lain."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/providers">
                <ArrowLeftIcon className="size-4" />
                Back to Providers
              </Link>
            </Button>
          }
        />
        <PageErrorCard error={queryError} />
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={providerName}
          description="Provider ini tidak ditemukan atau belum punya data yang bisa dikelola."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/providers">
                <ArrowLeftIcon className="size-4" />
                Back to Providers
              </Link>
            </Button>
          }
        />
        <NotFoundState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={providerName}
        description="Kelola satu provider dengan flow yang dipisah: overview, configurations, credentials, lalu danger zone."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/providers">
              <ArrowLeftIcon className="size-4" />
              Back to Providers
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant={providerSummary?.isReady ? "default" : "secondary"}>
            {providerSummary?.isReady ? "Ready" : "Needs attention"}
          </Badge>
          {providerSummary?.environments.map((item) => (
            <Badge key={item.environment} variant="outline">
              {item.environment}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4" />
            Overview
          </CardTitle>
          <CardDescription>
            Ringkasan readiness dan petunjuk cepat soal langkah berikutnya di provider ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/70 p-4">
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              Readiness
              <InfoTooltip content="Ready berarti setidaknya ada satu config enabled dan satu credential aktif pada environment yang sama." />
            </p>
            <p className="mt-2 text-xl font-semibold">{providerSummary?.isReady ? "Ready" : "Needs attention"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{providerSummary?.helperText}</p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm text-muted-foreground">Configs</p>
            <p className="mt-2 text-xl font-semibold">{configs.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Atur runtime configuration per environment.</p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              Active credentials
              <InfoTooltip content="Hanya credential berstatus active yang bisa dipakai runtime." />
            </p>
            <p className="mt-2 text-xl font-semibold">
              {credentials.filter((item) => item.status === "active").length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Nilai penuh secret tetap disembunyikan.</p>
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm text-muted-foreground">Environment scope</p>
            <p className="mt-2 text-xl font-semibold">{providerSummary?.environments.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {providerSummary?.environments.map((item) => item.environment).join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerCogIcon className="size-4" />
            Configurations
          </CardTitle>
          <CardDescription>
            Mulai dari sini saat provider belum siap. Tambah atau edit config tanpa bercampur dengan secret management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCreateConfig()}>
              <PlusIcon className="size-4" />
              Add runtime configuration
            </Button>
          </div>
          {configs.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Environment
                      <InfoTooltip content="Environment memisahkan config untuk production, staging, atau sandbox." />
                    </span>
                  </TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Priority
                      <InfoTooltip content="Angka prioritas dibaca backend saat memilih config provider." />
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Default model
                      <InfoTooltip content="Model utama untuk provider ini bila tidak ada override dari backend." />
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.environment}</TableCell>
                    <TableCell>
                      <Badge variant={config.is_enabled ? "default" : "secondary"}>
                        {config.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>{config.priority}</TableCell>
                    <TableCell>{config.default_model || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditConfig(config)}>
                        <PencilIcon className="size-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
              Belum ada config. Mulai dari <span className="font-medium text-foreground">Add runtime configuration</span>.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4" />
            Credentials
          </CardTitle>
          <CardDescription>
            Setelah config siap, tambahkan secret aktif. Rotate dilakukan di sini, sedangkan disable dan delete dipisah ke danger zone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCreateCredential()}>
              <PlusIcon className="size-4" />
              Add API key
            </Button>
          </div>
          {credentials.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credential</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last four</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-medium">{credential.credential_name}</TableCell>
                    <TableCell>{credential.environment}</TableCell>
                    <TableCell>
                      <Badge variant={credential.status === "active" ? "default" : "secondary"}>
                        {credential.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{credential.value_last_four ? `****${credential.value_last_four}` : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openRotateCredential(credential)}>
                        <RefreshCwIcon className="size-4" />
                        <span className="inline-flex items-center gap-1">
                          Rotate
                          <InfoTooltip content="Rotate berarti mengganti secret lama dengan nilai baru tanpa mengubah identitas credential." />
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
              Belum ada credential. Tambahkan credential aktif setelah config tersedia.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2Icon className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Action di area ini berdampak ke readiness provider. Disable dan delete dipisah ke sini supaya tidak tercampur dengan flow rutin.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="font-medium">Configs</p>
              <p className="text-sm text-muted-foreground">Hapus config hanya bila kamu yakin environment ini memang tidak dipakai lagi.</p>
            </div>
            {configs.length ? (
              configs.map((config) => (
                <div key={`danger-config-${config.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3">
                  <div>
                    <p className="font-medium">{config.environment}</p>
                    <p className="text-sm text-muted-foreground">
                      {config.default_model || "No default model"} · priority {config.priority}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmState({ kind: "delete-config", config })}
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                Tidak ada config untuk dihapus.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-medium">Credentials</p>
              <p className="text-sm text-muted-foreground">
                Disable menghentikan pemakaian secret. Delete menghapusnya permanen dari sistem.
              </p>
            </div>
            {credentials.length ? (
              credentials.map((credential) => {
                const removable = canRemoveCredential(credential, allConfigs, allCredentials);

                return (
                  <div
                    key={`danger-credential-${credential.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {credential.credential_name} · {credential.environment}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status {credential.status} {credential.value_last_four ? `· ****${credential.value_last_four}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!removable}
                        onClick={() => setConfirmState({ kind: "disable-credential", credential })}
                      >
                        <PowerOffIcon className="size-4" />
                        <span className="inline-flex items-center gap-1">
                          Disable
                          <InfoTooltip content="Disable menjaga data credential tetap tersimpan, tapi runtime tidak akan memakainya lagi." />
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!removable}
                        onClick={() => setConfirmState({ kind: "delete-credential", credential })}
                      >
                        <Trash2Icon className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                Tidak ada credential untuk di-disable atau dihapus.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={isConfigSheetOpen} onOpenChange={setIsConfigSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingConfig ? "Edit runtime configuration" : "Add runtime configuration"}</SheetTitle>
            <SheetDescription>
              Section ini hanya membahas config. Credential dikelola terpisah agar flownya tetap jelas.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitConfig}>
            <div className="flex-1 space-y-4 px-4 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Provider Type</FieldLabel>
                  <Input
                    disabled={!!editingConfig}
                    value={configForm.provider_type}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, provider_type: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Environment</FieldLabel>
                  <Input
                    disabled={!!editingConfig}
                    value={configForm.environment}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, environment: event.target.value }))
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
                  />
                </Field>
                <Field>
                  <FieldLabel className="inline-flex items-center gap-1">
                    Priority
                    <InfoTooltip content="Dipakai backend saat menyusun urutan provider config." />
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
                  <FieldLabel>Default Model</FieldLabel>
                  <Input
                    value={configForm.default_model}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, default_model: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Config JSON</FieldLabel>
                  <Textarea
                    value={configForm.config}
                    onChange={(event) =>
                      setConfigForm((current) => ({ ...current, config: event.target.value }))
                    }
                  />
                  <FieldDescription>Kosongkan bila provider tidak butuh konfigurasi tambahan.</FieldDescription>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsConfigSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createConfig.isPending || updateConfig.isPending}>
                {editingConfig ? "Save changes" : "Save configuration"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isCredentialSheetOpen} onOpenChange={setIsCredentialSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Add API key</SheetTitle>
            <SheetDescription>
              Tambahkan credential aktif untuk environment yang sesuai. Nilai penuh secret tidak akan ditampilkan ulang setelah tersimpan.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitCredential}>
            <div className="flex-1 space-y-4 px-4 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Credential Name</FieldLabel>
                  <Input
                    value={credentialForm.credential_name}
                    onChange={(event) =>
                      setCredentialForm((current) => ({ ...current, credential_name: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Environment</FieldLabel>
                  <Input
                    value={credentialForm.environment}
                    onChange={(event) =>
                      setCredentialForm((current) => ({ ...current, environment: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Credential Value</FieldLabel>
                  <Input
                    type="password"
                    value={credentialForm.value}
                    onChange={(event) =>
                      setCredentialForm((current) => ({ ...current, value: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Metadata JSON</FieldLabel>
                  <Textarea
                    value={credentialForm.metadata_}
                    onChange={(event) =>
                      setCredentialForm((current) => ({ ...current, metadata_: event.target.value }))
                    }
                  />
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsCredentialSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCredential.isPending}>
                Save credential
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isRotateSheetOpen} onOpenChange={setIsRotateSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Rotate key</SheetTitle>
            <SheetDescription>
              Ganti nilai secret untuk {rotatingCredential?.credential_name ?? "credential ini"} tanpa mengubah identitas credential.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitRotation}>
            <div className="flex-1 space-y-4 px-4 pb-4">
              <Field>
                <FieldLabel>New value</FieldLabel>
                <Input
                  type="password"
                  value={newCredentialValue}
                  onChange={(event) => setNewCredentialValue(event.target.value)}
                />
              </Field>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsRotateSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newCredentialValue.trim() || rotateCredential.isPending}>
                Rotate key
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmState} onOpenChange={(open) => !open && setConfirmState(null)}>
        {confirmState ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getConfirmCopy(confirmState).title}</AlertDialogTitle>
              <AlertDialogDescription>{getConfirmCopy(confirmState).description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={runConfirmAction}>
                {getConfirmCopy(confirmState).actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}
