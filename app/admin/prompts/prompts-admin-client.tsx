"use client";

import * as React from "react";
import { CheckCircle2Icon, FilePlus2Icon, Layers3Icon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  useActivatePromptVersionMutation,
  useCreatePromptTemplateMutation,
  useCreatePromptVersionMutation,
  useDeletePromptTemplateMutation,
  useDeletePromptVersionMutation,
  usePromptTemplatesQuery,
  useUpdatePromptTemplateMutation,
} from "@/hooks/use-admin";
import { ApiClientError, PromptTemplate } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function parseJsonOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as Record<string, unknown>;
}

function ErrorBanner({ error }: { error: Error }) {
  const requestId = error instanceof ApiClientError ? error.meta?.request_id : undefined;

  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">
      <p className="font-medium">Admin request failed</p>
      <p className="text-sm">{error.message}</p>
      {requestId ? <p className="mt-2 text-xs font-mono opacity-80">Request ID: {requestId}</p> : null}
    </div>
  );
}

export function PromptsAdminClient() {
  const templatesQuery = usePromptTemplatesQuery();
  const createTemplate = useCreatePromptTemplateMutation();
  const updateTemplate = useUpdatePromptTemplateMutation();
  const deleteTemplate = useDeletePromptTemplateMutation();
  const createVersion = useCreatePromptVersionMutation();
  const activateVersion = useActivatePromptVersionMutation();
  const deleteVersion = useDeletePromptVersionMutation();

  const templates = React.useMemo(() => templatesQuery.data ?? [], [templatesQuery.data]);
  const activeTemplateCount = templates.filter((template) => template.active_version_id).length;
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [editingTemplate, setEditingTemplate] = React.useState<PromptTemplate | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
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
  const [versionForm, setVersionForm] = React.useState({
    version_tag: "",
    content: "",
    input_schema: "",
    output_schema: "",
    model_preferences: "",
  });

  const selectedTemplate = React.useMemo(() => {
    if (selectedTemplateId) return templates.find((template) => template.id === selectedTemplateId) ?? null;
    return templates[0] ?? null;
  }, [selectedTemplateId, templates]);

  React.useEffect(() => {
    if (!selectedTemplateId && templates[0]) setSelectedTemplateId(templates[0].id);
  }, [selectedTemplateId, templates]);

  const resetTemplateForm = () => {
    setEditingTemplate(null);
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
  };

  const beginEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setTemplateForm((current) => ({
      ...current,
      name: template.name,
      task_type: template.task_type,
      description: template.description ?? "",
    }));
  };

  const submitTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          templateId: editingTemplate.id,
          payload: {
            name: templateForm.name.trim(),
            description: templateForm.description.trim() || null,
          },
        });
      } else {
        if (!templateForm.content.trim()) {
          setFormError("Initial version content wajib diisi.");
          return;
        }
        await createTemplate.mutateAsync({
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
      }
      resetTemplateForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save prompt template");
    }
  };

  const submitVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!selectedTemplate) {
      setFormError("Pilih template terlebih dahulu.");
      return;
    }

    try {
      await createVersion.mutateAsync({
        templateId: selectedTemplate.id,
        payload: {
          version_tag: versionForm.version_tag.trim(),
          content: versionForm.content.trim(),
          input_schema: parseJsonOrNull(versionForm.input_schema),
          output_schema: parseJsonOrNull(versionForm.output_schema),
          model_preferences: parseJsonOrNull(versionForm.model_preferences),
        },
      });
      setVersionForm({ version_tag: "", content: "", input_schema: "", output_schema: "", model_preferences: "" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create version");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Prompt Templates" description="Kelola prompt, versi aktif, dan guard minimum runtime." />

      {templatesQuery.error ? <ErrorBanner error={templatesQuery.error} /> : null}
      {formError ? <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-sm text-destructive">{formError}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers3Icon className="size-4" />Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">Create first prompt template.</div>
              ) : templates.map((template) => {
                const selected = selectedTemplate?.id === template.id;
                const canDelete = !template.active_version_id || activeTemplateCount > 1;
                return (
                  <div key={template.id} className={`rounded-md border px-4 py-4 ${selected ? "border-primary/30 bg-primary/5" : "border-border/70"}`}>
                    <button type="button" className="w-full text-left" onClick={() => setSelectedTemplateId(template.id)}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{template.name}</p>
                            <Badge variant="outline">{template.task_type}</Badge>
                          </div>
                          {template.description ? <p className="text-sm text-muted-foreground">{template.description}</p> : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={template.active_version_id ? "default" : "secondary"}>{template.active_version_id ? "Has active version" : "No active version"}</Badge>
                          <span className="text-xs text-muted-foreground">{template.versions.length} version(s)</span>
                        </div>
                      </div>
                    </button>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => beginEditTemplate(template)}><PencilIcon className="mr-2 size-4" />Edit</Button>
                      <Button variant="outline" size="sm" disabled={!canDelete || deleteTemplate.isPending} onClick={() => window.confirm("Delete prompt template?") && deleteTemplate.mutate(template.id)}><Trash2Icon className="mr-2 size-4" />Delete</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTemplate.versions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">Template ini belum punya versi.</div>
                ) : selectedTemplate.versions.map((version) => {
                  const isActive = selectedTemplate.active_version_id === version.id;
                  return (
                    <div key={version.id} className="rounded-md border border-border/70 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{version.version_tag}</p>
                            <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : version.status}</Badge>
                          </div>
                          <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{version.content}</p>
                        </div>
                        <div className="flex gap-2">
                          {!isActive ? (
                            <Button variant="outline" size="sm" disabled={activateVersion.isPending} onClick={() => activateVersion.mutate({ templateId: selectedTemplate.id, versionId: version.id })}><CheckCircle2Icon className="mr-2 size-4" />Activate</Button>
                          ) : null}
                          <Button variant="outline" size="sm" disabled={isActive || deleteVersion.isPending} onClick={() => window.confirm("Delete prompt version?") && deleteVersion.mutate({ templateId: selectedTemplate.id, versionId: version.id })}><Trash2Icon className="mr-2 size-4" />Delete</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FilePlus2Icon className="size-4" />{editingTemplate ? "Edit Template" : "Create Template"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitTemplate}>
                <FieldGroup>
                  <Field><FieldLabel>Name</FieldLabel><Input value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} /></Field>
                  <Field><FieldLabel>Task Type</FieldLabel><Input disabled={!!editingTemplate} value={templateForm.task_type} onChange={(event) => setTemplateForm((current) => ({ ...current, task_type: event.target.value }))} /></Field>
                  <Field><FieldLabel>Description</FieldLabel><Textarea value={templateForm.description} onChange={(event) => setTemplateForm((current) => ({ ...current, description: event.target.value }))} /></Field>
                  {!editingTemplate ? (
                    <>
                      <Field><FieldLabel>Initial Version Tag</FieldLabel><Input value={templateForm.version_tag} onChange={(event) => setTemplateForm((current) => ({ ...current, version_tag: event.target.value }))} /></Field>
                      <Field><FieldLabel>Initial Content</FieldLabel><Textarea className="min-h-40" value={templateForm.content} onChange={(event) => setTemplateForm((current) => ({ ...current, content: event.target.value }))} /></Field>
                      <Field><FieldLabel>Input Schema JSON</FieldLabel><Textarea value={templateForm.input_schema} onChange={(event) => setTemplateForm((current) => ({ ...current, input_schema: event.target.value }))} /><FieldDescription>Kosongkan bila tidak dibutuhkan.</FieldDescription></Field>
                      <Field><FieldLabel>Output Schema JSON</FieldLabel><Textarea value={templateForm.output_schema} onChange={(event) => setTemplateForm((current) => ({ ...current, output_schema: event.target.value }))} /></Field>
                      <Field><FieldLabel>Model Preferences JSON</FieldLabel><Textarea value={templateForm.model_preferences} onChange={(event) => setTemplateForm((current) => ({ ...current, model_preferences: event.target.value }))} /></Field>
                    </>
                  ) : null}
                </FieldGroup>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>{editingTemplate ? "Save Template" : "Create Template"}</Button>
                  {editingTemplate ? <Button type="button" variant="outline" onClick={resetTemplateForm}>Cancel</Button> : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Create Version</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitVersion}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Target Template</FieldLabel>
                    <Select value={selectedTemplate?.id ?? ""} onValueChange={(value) => setSelectedTemplateId(value)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose template" /></SelectTrigger>
                      <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field><FieldLabel>Version Tag</FieldLabel><Input value={versionForm.version_tag} onChange={(event) => setVersionForm((current) => ({ ...current, version_tag: event.target.value }))} /></Field>
                  <Field><FieldLabel>Content</FieldLabel><Textarea className="min-h-40" value={versionForm.content} onChange={(event) => setVersionForm((current) => ({ ...current, content: event.target.value }))} /></Field>
                  <Field><FieldLabel>Input Schema JSON</FieldLabel><Textarea value={versionForm.input_schema} onChange={(event) => setVersionForm((current) => ({ ...current, input_schema: event.target.value }))} /></Field>
                  <Field><FieldLabel>Output Schema JSON</FieldLabel><Textarea value={versionForm.output_schema} onChange={(event) => setVersionForm((current) => ({ ...current, output_schema: event.target.value }))} /></Field>
                  <Field><FieldLabel>Model Preferences JSON</FieldLabel><Textarea value={versionForm.model_preferences} onChange={(event) => setVersionForm((current) => ({ ...current, model_preferences: event.target.value }))} /></Field>
                </FieldGroup>
                <Button type="submit" disabled={createVersion.isPending || templates.length === 0}>Create Version</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
