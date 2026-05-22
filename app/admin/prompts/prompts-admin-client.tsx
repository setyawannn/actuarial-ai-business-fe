"use client";

import * as React from "react";
import Link from "next/link";
import { CircleHelpIcon, FilePlus2Icon, PencilLineIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCreatePromptTemplateMutation,
  useDeletePromptTemplateMutation,
  usePromptTemplatesQuery,
  useUpdatePromptTemplateMutation,
} from "@/hooks/use-admin";
import { ApiClientError, PromptTemplate } from "@/types/api";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import { PageHeader } from "@/components/page-header";
import { InfoTooltip } from "@/components/info-tooltip";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
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
      <p className="font-medium">Prompt templates belum bisa dimuat</p>
      <p className="mt-1 text-sm">{error.message}</p>
      {requestId ? <p className="mt-2 font-mono text-xs opacity-80">Request ID: {requestId}</p> : null}
    </div>
  );
}

export function PromptsAdminClient() {
  const router = useRouter();
  const templatesQuery = usePromptTemplatesQuery();
  const createTemplate = useCreatePromptTemplateMutation();
  const updateTemplate = useUpdatePromptTemplateMutation();
  const deleteTemplate = useDeletePromptTemplateMutation();

  const templates = React.useMemo(() => templatesQuery.data ?? [], [templatesQuery.data]);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [deleteTemplateState, setDeleteTemplateState] = React.useState<PromptTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = React.useState<PromptTemplate | null>(null);
  const [templateForm, setTemplateForm] = React.useState({
    name: "",
    task_type: "",
    description: "",
    version_tag: "v1",
    content: "",
    input_schema: "",
    output_schema: "",
    model_preferences: "",
  });

  function resetTemplateForm() {
    setTemplateForm({
      name: "",
      task_type: "",
      description: "",
      version_tag: "v1",
      content: "",
      input_schema: "",
      output_schema: "",
      model_preferences: "",
    });
  }

  function openEdit(template: PromptTemplate) {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      task_type: template.task_type,
      description: template.description ?? "",
      version_tag: "v1",
      content: "",
      input_schema: "",
      output_schema: "",
      model_preferences: "",
    });
    setIsEditOpen(true);
  }

  async function submitCreateTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const created = await createTemplate.mutateAsync({
        name: templateForm.name.trim(),
        task_type: templateForm.task_type.trim(),
        description: templateForm.description.trim() || null,
        initial_version: {
          version_tag: templateForm.version_tag.trim() || "v1",
          content: templateForm.content.trim(),
          input_schema: parseJsonOrNull(templateForm.input_schema),
          output_schema: parseJsonOrNull(templateForm.output_schema),
          model_preferences: parseJsonOrNull(templateForm.model_preferences),
        },
      });

      showAdminSuccess("Prompt template created", "Template baru siap dibuka di editor.");
      resetTemplateForm();
      setIsCreateOpen(false);
      router.push(`/admin/prompts/${created.id}`);
    } catch (error) {
      showAdminError("Failed to create prompt template", error);
    }
  }

  async function submitEditTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTemplate) return;

    try {
      await updateTemplate.mutateAsync({
        templateId: editingTemplate.id,
        payload: {
          name: templateForm.name.trim(),
          description: templateForm.description.trim() || null,
        },
      });

      showAdminSuccess("Prompt template updated");
      setIsEditOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
    } catch (error) {
      showAdminError("Failed to update prompt template", error);
    }
  }

  async function handleDeleteTemplate() {
    if (!deleteTemplateState) return;

    try {
      await deleteTemplate.mutateAsync(deleteTemplateState.id);
      showAdminSuccess("Prompt template deleted");
      setDeleteTemplateState(null);
    } catch (error) {
      showAdminError("Failed to delete prompt template", error);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt Templates"
        description="Pilih template, lalu masuk ke editor khusus untuk menulis prompt dan menyisipkan variable dengan lebih mudah."
        actions={
          <>
            <Button variant="outline" size="icon-sm" onClick={() => setIsGuideOpen(true)}>
              <CircleHelpIcon className="size-4" />
              <span className="sr-only">Open prompt workspace guide</span>
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <FilePlus2Icon className="size-4" />
              Add Template
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline">Templates {templates.length}</Badge>
          <Badge variant="outline">
            Active ready {templates.filter((item) => item.active_version_id).length}
          </Badge>
        </div>
      </PageHeader>

      {templatesQuery.error ? <PageErrorCard error={templatesQuery.error} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            Gunakan tombol <span className="font-medium text-foreground">Open workspace</span> untuk masuk ke halaman kerja prompt yang lebih sederhana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Task type</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Active version
                      <InfoTooltip content="Versi aktif adalah prompt yang saat ini dipakai runtime." />
                    </span>
                  </TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{template.name}</p>
                        {template.description ? (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.task_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.active_version_id ? "default" : "secondary"}>
                        {template.active_version_id ? "Ready" : "No active version"}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.versions.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/prompts/${template.id}`}>Open workspace</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                          <PencilLineIcon className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTemplateState(template)}
                        >
                          <Trash2Icon className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
              Belum ada prompt template. Mulai dari tombol <span className="font-medium text-foreground">Add Template</span>.
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Add Template</SheetTitle>
            <SheetDescription>
              Template baru butuh initial version agar user bisa langsung menulis prompt dan mengelola versinya.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitCreateTemplate}>
            <div className="grid flex-1 gap-4 px-4 pb-4 xl:grid-cols-2">
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={templateForm.name}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Task Type</FieldLabel>
                  <Input
                    value={templateForm.task_type}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, task_type: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={templateForm.description}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Initial Version Tag</FieldLabel>
                  <Input
                    value={templateForm.version_tag}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, version_tag: event.target.value }))
                    }
                  />
                </Field>
                <Field className="xl:col-span-2">
                  <FieldLabel>Initial Prompt Content</FieldLabel>
                  <Textarea
                    className="min-h-64"
                    value={templateForm.content}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, content: event.target.value }))
                    }
                  />
                  <FieldDescription>
                    Setelah template dibuat, prompt bisa disempurnakan di editor dengan drag and drop variable.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Input Schema JSON</FieldLabel>
                  <Textarea
                    className="min-h-40"
                    value={templateForm.input_schema}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, input_schema: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Output Schema JSON</FieldLabel>
                  <Textarea
                    className="min-h-40"
                    value={templateForm.output_schema}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, output_schema: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Model Preferences JSON</FieldLabel>
                  <Textarea
                    className="min-h-40"
                    value={templateForm.model_preferences}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, model_preferences: event.target.value }))
                    }
                  />
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplate.isPending || !templateForm.content.trim()}>
                Create template
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Prompt Workspace Guide</SheetTitle>
            <SheetDescription>
              Panduan ini opsional. Kalau sudah paham alurnya, cukup tutup dan lanjut kerja.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="rounded-xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">1. Create template</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Tambahkan nama, task type, dan initial prompt agar workspace bisa langsung dipakai.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">2. Open workspace</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Buka satu template untuk edit working draft secara fokus tanpa terganggu template lain.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">3. Save draft and publish</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Drag variable ke editor, simpan working draft, lalu publish saat prompt sudah siap dipakai runtime.
              </p>
            </div>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setIsGuideOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit Template Metadata</SheetTitle>
            <SheetDescription>
              Edit ringan seperti nama dan deskripsi dilakukan di sini. Isi prompt tetap dikelola per version di editor.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitEditTemplate}>
            <div className="flex-1 space-y-4 px-4 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={templateForm.name}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Task Type</FieldLabel>
                  <Input value={templateForm.task_type} disabled />
                  <FieldDescription>Task type tetap dibaca dari template yang sudah ada.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={templateForm.description}
                    onChange={(event) =>
                      setTemplateForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTemplate.isPending}>
                Save changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTemplateState} onOpenChange={(open) => !open && setDeleteTemplateState(null)}>
        {deleteTemplateState ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this prompt template?</AlertDialogTitle>
              <AlertDialogDescription>
                Template dan semua versinya akan dihapus permanen. Pastikan template ini memang tidak lagi dipakai runtime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTemplate}>Delete template</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}
