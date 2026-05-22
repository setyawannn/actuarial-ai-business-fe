"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  FileClockIcon,
  RefreshCwIcon,
  RocketIcon,
  Trash2Icon,
} from "lucide-react";
import {
  useActivatePromptVersionMutation,
  useDeletePromptVersionMutation,
  usePromptTemplateDetailQuery,
  usePromptVariablesQuery,
  usePublishPromptDraftMutation,
  useRenderPromptPreviewMutation,
  useSavePromptDraftMutation,
  useValidatePromptVersionMutation,
} from "@/hooks/use-admin";
import { ApiClientError, PromptTemplateVersion } from "@/types/api";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import {
  getPromptTokens,
  getPromptVariables,
  getPromptVersionStatusDescription,
  getPromptVersionStatusLabel,
  mergePromptVariables,
  resolvePublishedVersion,
  resolveWorkingDraft,
} from "@/lib/prompt-editor";
import { PageHeader } from "@/components/page-header";
import { InfoTooltip } from "@/components/info-tooltip";
import { NotFoundState } from "@/components/states";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  PromptEditorTextarea,
  PromptEditorTextareaHandle,
} from "@/components/prompt-editor/prompt-editor-textarea";
import { PromptValidationPanel } from "@/components/prompt-editor/prompt-validation-panel";
import { PromptVariableList } from "@/components/prompt-editor/prompt-variable-list";

function stringifyJson(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value, null, 2) : "";
}

function parseJsonOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as Record<string, unknown>;
}

function PageErrorCard({
  title,
  error,
}: {
  title: string;
  error: Error;
}) {
  const requestId = error instanceof ApiClientError ? error.meta?.request_id : undefined;

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm">{error.message}</p>
      {requestId ? <p className="mt-2 font-mono text-xs opacity-80">Request ID: {requestId}</p> : null}
    </div>
  );
}

function canDeleteVersion(version: PromptTemplateVersion | null, activeVersionId: string | null) {
  if (!version) return false;
  return version.id !== activeVersionId;
}

type DraftFormState = {
  content: string;
  input_schema: string;
  output_schema: string;
  model_preferences: string;
  change_note: string;
};

function makeInitialDraftState(source: PromptTemplateVersion | null): DraftFormState {
  return {
    content: source?.content ?? "",
    input_schema: stringifyJson(source?.input_schema),
    output_schema: stringifyJson(source?.output_schema),
    model_preferences: stringifyJson(source?.model_preferences),
    change_note: source?.change_note ?? "",
  };
}

function PromptWorkspaceForm({
  templateId,
  workingDraft,
  publishedVersion,
  variables,
}: {
  templateId: string;
  workingDraft: PromptTemplateVersion | null;
  publishedVersion: PromptTemplateVersion | null;
  variables: ReturnType<typeof mergePromptVariables>;
}) {
  const saveDraft = useSavePromptDraftMutation();
  const publishDraft = usePublishPromptDraftMutation();
  const validateVersion = useValidatePromptVersionMutation();
  const renderPreview = useRenderPromptPreviewMutation();
  const editorRef = React.useRef<PromptEditorTextareaHandle | null>(null);
  const [draftForm, setDraftForm] = React.useState<DraftFormState>(() =>
    makeInitialDraftState(workingDraft)
  );
  const [previewContent, setPreviewContent] = React.useState("");
  const [validationResult, setValidationResult] = React.useState<{
    tokens_used: string[];
    unknown_tokens: string[];
    missing_required_variables: string[];
    warnings: string[];
  } | null>(null);
  const [isPublishOpen, setIsPublishOpen] = React.useState(false);
  const [publishTag, setPublishTag] = React.useState("");
  const [publishNote, setPublishNote] = React.useState(workingDraft?.change_note ?? publishedVersion?.change_note ?? "");

  const editorBase = workingDraft ?? publishedVersion;
  const isFallbackFromPublished = !workingDraft && !!publishedVersion;
  const usedTokens = React.useMemo(() => getPromptTokens(draftForm.content), [draftForm.content]);

  async function handleSaveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await saveDraft.mutateAsync({
        templateId,
        payload: {
          content: draftForm.content.trim(),
          input_schema: parseJsonOrNull(draftForm.input_schema),
          output_schema: parseJsonOrNull(draftForm.output_schema),
          model_preferences: parseJsonOrNull(draftForm.model_preferences),
          change_note: draftForm.change_note.trim() || null,
        },
      });
      showAdminSuccess("Working draft saved", "Perubahan di sini menyimpan draft kerja.");
    } catch (error) {
      showAdminError("Failed to save working draft", error);
    }
  }

  async function handleValidate() {
    if (!draftForm.content.trim()) return;

    try {
      const result = await validateVersion.mutateAsync({
        templateId,
        payload: {
          content: draftForm.content.trim(),
          input_schema: parseJsonOrNull(draftForm.input_schema),
          output_schema: parseJsonOrNull(draftForm.output_schema),
          model_preferences: parseJsonOrNull(draftForm.model_preferences),
        },
      });
      setValidationResult(result);
      showAdminSuccess("Draft validated");
    } catch (error) {
      showAdminError("Failed to validate draft", error);
    }
  }

  async function handlePreview() {
    if (!draftForm.content.trim()) return;

    try {
      const result = await renderPreview.mutateAsync({
        templateId,
        payload: {
          content: draftForm.content.trim(),
          input_schema: parseJsonOrNull(draftForm.input_schema),
          output_schema: parseJsonOrNull(draftForm.output_schema),
          model_preferences: parseJsonOrNull(draftForm.model_preferences),
        },
      });
      setPreviewContent(
        result.rendered_prompt ?? result.preview ?? result.content ?? "Preview tidak mengembalikan konten."
      );
      showAdminSuccess("Preview generated");
    } catch (error) {
      showAdminError("Failed to render preview", error);
    }
  }

  async function handlePublish() {
    try {
      await publishDraft.mutateAsync({
        templateId,
        payload: {
          version_tag: publishTag.trim() || null,
          change_note: publishNote.trim() || null,
        },
      });
      showAdminSuccess("Draft published", "Versi published sekarang dipakai runtime.");
      setIsPublishOpen(false);
    } catch (error) {
      showAdminError("Failed to publish draft", error);
    }
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Prompt Workspace</CardTitle>
              <CardDescription>
                Edit prompt langsung di sini. Perubahan akan disimpan sebagai working draft, lalu bisa dipreview dan dipublish saat siap.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={validateVersion.isPending || !draftForm.content.trim()}
              >
                <RefreshCwIcon className="size-4" />
                Validate
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={renderPreview.isPending || !draftForm.content.trim()}
              >
                <EyeIcon className="size-4" />
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPublishOpen(true)}
                disabled={publishDraft.isPending || !draftForm.content.trim()}
              >
                <RocketIcon className="size-4" />
                Publish
              </Button>
              <Button
                type="submit"
                form="prompt-workspace-form"
                disabled={saveDraft.isPending || !draftForm.content.trim()}
              >
                Save draft
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form id="prompt-workspace-form" className="space-y-6" onSubmit={handleSaveDraft}>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Working state</p>
                <p className="mt-2 font-medium">
                  {workingDraft ? "Working draft tersedia" : "Belum ada working draft"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {workingDraft
                    ? "Editor membaca draft kerja dari backend, jadi previous content langsung siap diedit."
                    : "Backend belum mengirim working draft. Editor memakai published version sebagai dasar edit sementara."}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Published version</p>
                <p className="mt-2 font-medium">{publishedVersion?.version_tag ?? "Belum ada"}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Publish akan membuat versi yang dipakai runtime.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Editor source</p>
                <p className="mt-2 font-medium">
                  {editorBase?.version_tag ?? "No source"}
                  {isFallbackFromPublished ? " (published fallback)" : ""}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Previous data harus tampil dari sumber ini: content, schema, dan model preferences.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
              <div className="space-y-5">
                <Field>
                  <FieldLabel className="inline-flex items-center gap-1">
                    Prompt Content
                    <InfoTooltip content="Klik variable akan insert di posisi cursor. Drag and drop akan masuk ke titik drop di textarea." />
                  </FieldLabel>
                  <PromptEditorTextarea
                    ref={editorRef}
                    initialValue={draftForm.content}
                    onValueChange={(value) =>
                      setDraftForm((current) => ({ ...current, content: value }))
                    }
                  />
                  <FieldDescription>
                    Perubahan di sini menyimpan draft kerja. History dipakai untuk audit dan rollback, bukan untuk edit harian.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Change Note</FieldLabel>
                  <Input
                    value={draftForm.change_note}
                    onChange={(event) =>
                      setDraftForm((current) => ({ ...current, change_note: event.target.value }))
                    }
                    placeholder="Catatan singkat perubahan draft"
                  />
                </Field>

                <div className="grid gap-4 xl:grid-cols-3">
                  <Field>
                    <FieldLabel>Input Schema JSON</FieldLabel>
                    <Textarea
                      className="min-h-40 font-mono text-[13px]"
                      value={draftForm.input_schema}
                      onChange={(event) =>
                        setDraftForm((current) => ({ ...current, input_schema: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Output Schema JSON</FieldLabel>
                    <Textarea
                      className="min-h-40 font-mono text-[13px]"
                      value={draftForm.output_schema}
                      onChange={(event) =>
                        setDraftForm((current) => ({ ...current, output_schema: event.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Model Preferences JSON</FieldLabel>
                    <Textarea
                      className="min-h-40 font-mono text-[13px]"
                      value={draftForm.model_preferences}
                      onChange={(event) =>
                        setDraftForm((current) => ({
                          ...current,
                          model_preferences: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <Card className="py-0">
                  <CardHeader className="border-b">
                    <CardTitle className="text-sm">Draft tokens</CardTitle>
                    <CardDescription>Backend validate dan preview akan memakai isi draft terbaru.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {usedTokens.length ? (
                      <div className="flex flex-wrap gap-2">
                        {usedTokens.map((token) => (
                          <Badge key={token} variant="outline">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Belum ada variable yang dipakai di draft ini.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {validationResult ? <PromptValidationPanel result={validationResult} /> : null}

                {previewContent ? (
                  <Card className="py-0">
                    <CardHeader className="border-b">
                      <CardTitle className="text-sm">Rendered preview</CardTitle>
                      <CardDescription>
                        Kalau preview kosong, itu hasil backend dan bukan berarti editor tidak menyimpan data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-muted/20 p-3 text-sm leading-6 text-foreground">
                        {previewContent}
                      </pre>
                    </CardContent>
                  </Card>
                ) : null}

                <PromptVariableList
                  variables={variables}
                  onInsert={(token) => editorRef.current?.insertToken(token)}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Sheet open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Publish Draft</SheetTitle>
            <SheetDescription>
              Publish akan membuat versi yang dipakai runtime. Version tag sekarang hanya dipakai sebagai metadata release, bukan untuk edit harian.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-4">
            <Field>
              <FieldLabel>Version Tag</FieldLabel>
              <Input
                value={publishTag}
                onChange={(event) => setPublishTag(event.target.value)}
                placeholder="Contoh: v3 atau 2026-05 prompt refresh"
              />
            </Field>
            <Field>
              <FieldLabel>Publish Note</FieldLabel>
              <Textarea
                value={publishNote}
                onChange={(event) => setPublishNote(event.target.value)}
                placeholder="Ringkas apa yang berubah pada publish ini"
              />
            </Field>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setIsPublishOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePublish} disabled={publishDraft.isPending}>
              Publish now
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function PromptTemplateDetailClient({ templateId }: { templateId: string }) {
  const templateQuery = usePromptTemplateDetailQuery(templateId, true);
  const variablesQuery = usePromptVariablesQuery(templateId, true);
  const activateVersion = useActivatePromptVersionMutation();
  const deleteVersion = useDeletePromptVersionMutation();
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [deleteVersionState, setDeleteVersionState] = React.useState<PromptTemplateVersion | null>(null);

  const template = templateQuery.data ?? null;
  const workingDraft = React.useMemo(() => resolveWorkingDraft(template), [template]);
  const publishedVersion = React.useMemo(() => resolvePublishedVersion(template), [template]);
  const inferredVariables = React.useMemo(
    () => getPromptVariables(template, workingDraft ?? publishedVersion),
    [publishedVersion, template, workingDraft]
  );
  const variables = React.useMemo(
    () => mergePromptVariables(inferredVariables, variablesQuery.data),
    [inferredVariables, variablesQuery.data]
  );

  async function handleActivateVersion(versionId: string) {
    if (!template) return;
    try {
      await activateVersion.mutateAsync({ templateId: template.id, versionId });
      showAdminSuccess("Published version updated");
    } catch (error) {
      showAdminError("Failed to publish selected history version", error);
    }
  }

  async function handleDeleteVersion() {
    if (!template || !deleteVersionState) return;
    try {
      await deleteVersion.mutateAsync({
        templateId: template.id,
        versionId: deleteVersionState.id,
      });
      showAdminSuccess("History version deleted");
      setDeleteVersionState(null);
    } catch (error) {
      showAdminError("Failed to delete history version", error);
    }
  }

  if (templateQuery.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Prompt Workspace"
          description="Halaman kerja utama untuk mengedit prompt."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/prompts">
                <ArrowLeftIcon className="size-4" />
                Back to Prompts
              </Link>
            </Button>
          }
        />
        <PageErrorCard title="Prompt workspace belum bisa dimuat" error={templateQuery.error} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Prompt Workspace"
          description="Template prompt tidak ditemukan."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/prompts">
                <ArrowLeftIcon className="size-4" />
                Back to Prompts
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
        title={template.name}
        description="Satu halaman ini jadi tempat kerja utama: edit prompt, simpan working draft, preview, dan publish. History dipisah agar alurnya tetap sederhana."
        actions={
          <>
            <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
              <FileClockIcon className="size-4" />
              Version history
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/prompts">
                <ArrowLeftIcon className="size-4" />
                Back to Prompts
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline">{template.task_type}</Badge>
          <Badge variant={workingDraft ? "default" : "secondary"}>
            {workingDraft ? "Working draft" : "Using published as draft base"}
          </Badge>
          <Badge variant="outline">
            {publishedVersion ? `Published ${publishedVersion.version_tag}` : "No published version"}
          </Badge>
          <Badge variant="outline">{template.versions.length} history versions</Badge>
        </div>
      </PageHeader>

      {variablesQuery.error ? (
        <PageErrorCard title="Variable catalog belum bisa dimuat" error={variablesQuery.error} />
      ) : null}

      <PromptWorkspaceForm
        key={`${template.id}:${workingDraft?.id ?? "published"}:${workingDraft?.updated_at ?? publishedVersion?.updated_at ?? "none"}`}
        templateId={template.id}
        workingDraft={workingDraft}
        publishedVersion={publishedVersion}
        variables={variables}
      />

      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              History dipakai untuk audit dan rollback. Area ini bukan tempat edit harian.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            {template.versions.length ? (
              template.versions.map((version) => {
                const isActive = template.active_version_id === version.id;
                return (
                  <Card key={version.id}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{version.version_tag || "Untitled version"}</p>
                            <Badge variant={isActive ? "default" : "outline"}>
                              {getPromptVersionStatusLabel(version.status, version.is_draft, isActive)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getPromptVersionStatusDescription(version.status, version.is_draft, isActive)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateVersion(version.id)}
                              disabled={activateVersion.isPending}
                            >
                              <CheckCircle2Icon className="size-4" />
                              Publish this
                            </Button>
                          ) : null}
                          {canDeleteVersion(version, template.active_version_id) ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteVersionState(version)}
                            >
                              <Trash2Icon className="size-4" />
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-muted/20 p-3 text-sm leading-6 text-foreground">
                        {version.content}
                      </pre>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                Belum ada history version untuk template ini.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteVersionState}
        onOpenChange={(open) => !open && setDeleteVersionState(null)}
      >
        {deleteVersionState ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this history version?</AlertDialogTitle>
              <AlertDialogDescription>
                Versi history akan dihapus permanen. Versi published tidak bisa dihapus dari sini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteVersion}>Delete version</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}
