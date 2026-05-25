import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ApiClientError,
  ApiEnvelope,
  PromptTemplate,
  PromptRenderPreview,
  PromptValidationResult,
  PromptVariableDefinition,
  ProviderConfig,
  ProviderCredential,
  AdminUsageData,
  AdminRunAuditData
} from "@/types/api";

function getEnvelopeErrorMessage<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) return fallback;

  return data.message || data.error?.message || data.errors?.[0]?.message || fallback;
}

function getEnvelopeErrorCode<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) return fallback;

  return data.code || data.error?.code || fallback;
}

async function parseEnvelope<T>(res: Response, fallback: string): Promise<T> {
  const data = (await res.json()) as ApiEnvelope<T>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, fallback),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }

  return data.data;
}

export function usePromptTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.admin.promptTemplates,
    queryFn: async () => {
      const res = await fetch("/api/admin/prompt-templates");
      return parseEnvelope<PromptTemplate[]>(res, "Failed to fetch prompt templates");
    },
    retry: false,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function usePromptTemplateDetailQuery(templateId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.admin.promptTemplates, "detail", templateId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}`);
      return parseEnvelope<PromptTemplate>(res, "Failed to fetch prompt template detail");
    },
    enabled: enabled && Boolean(templateId),
    retry: false,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreatePromptTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      task_type: string;
      description?: string | null;
      initial_version: {
        version_tag: string;
        content: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
      };
    }) => {
      const res = await fetch("/api/admin/prompt-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to create prompt template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useUpdatePromptTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: { name?: string; description?: string | null };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to update prompt template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useDeletePromptTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}`, {
        method: "DELETE",
      });

      return parseEnvelope<{ id: string }>(res, "Failed to delete prompt template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useCreatePromptVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: {
        version_tag: string;
        content: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
        change_note?: string | null;
        created_from_version_id?: string | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to create prompt version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useUpdatePromptVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      versionId,
      payload,
    }: {
      templateId: string;
      versionId: string;
      payload: {
        content?: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
        version_tag?: string;
        change_note?: string | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/versions/${versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to update prompt version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useSavePromptDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: {
        content: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
        change_note?: string | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to save prompt draft");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.promptTemplates, "detail", variables.templateId],
      });
    },
  });
}

export function usePublishPromptDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload?: {
        version_tag?: string | null;
        change_note?: string | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });

      return parseEnvelope<PromptTemplate>(res, "Failed to publish prompt draft");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.admin.promptTemplates, "detail", variables.templateId],
      });
    },
  });
}

export function useDeletePromptVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      versionId,
    }: {
      templateId: string;
      versionId: string;
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/versions/${versionId}`, {
        method: "DELETE",
      });

      return parseEnvelope<{ id: string }>(res, "Failed to delete prompt version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function useActivatePromptVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      versionId,
    }: {
      templateId: string;
      versionId: string;
    }) => {
      const res = await fetch(
        `/api/admin/prompt-templates/${templateId}/versions/${versionId}/activate`,
        { method: "POST" }
      );

      return parseEnvelope<PromptTemplate>(res, "Failed to activate prompt version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promptTemplates });
    },
  });
}

export function usePromptVariablesQuery(templateId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.promptVariables(templateId),
    queryFn: async () => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/variables`);
      return parseEnvelope<PromptVariableDefinition[]>(res, "Failed to fetch prompt variables");
    },
    enabled: enabled && Boolean(templateId),
    retry: false,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useValidatePromptVersionMutation() {
  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: {
        content: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/versions/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptValidationResult>(res, "Failed to validate prompt version");
    },
  });
}

export function useRenderPromptPreviewMutation() {
  return useMutation({
    mutationFn: async ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: {
        content: string;
        input_schema?: Record<string, unknown> | null;
        output_schema?: Record<string, unknown> | null;
        model_preferences?: Record<string, unknown> | null;
      };
    }) => {
      const res = await fetch(`/api/admin/prompt-templates/${templateId}/versions/render-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<PromptRenderPreview>(res, "Failed to render prompt preview");
    },
  });
}

export function useUpdateProviderConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      configId,
      payload,
    }: {
      configId: string;
      payload: {
        is_enabled?: boolean;
        priority?: number;
        default_model?: string | null;
        config?: Record<string, unknown> | null;
      };
    }) => {
      const res = await fetch(`/api/admin/provider-configs/${configId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<ProviderConfig>(res, "Failed to update provider config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerConfigs });
    },
  });
}

export function useDeleteProviderConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configId: string) => {
      const res = await fetch(`/api/admin/provider-configs/${configId}`, { method: "DELETE" });

      return parseEnvelope<{ id: string }>(res, "Failed to delete provider config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerConfigs });
    },
  });
}

export function useProviderConfigsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.providerConfigs,
    queryFn: async () => {
      const res = await fetch("/api/admin/provider-configs");
      return parseEnvelope<ProviderConfig[]>(res, "Failed to fetch provider configs");
    },
    retry: false,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreateProviderConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider_name: string;
      provider_type: string;
      is_enabled: boolean;
      priority: number;
      default_model?: string | null;
      config?: Record<string, unknown> | null;
      environment: string;
    }) => {
      const res = await fetch("/api/admin/provider-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<ProviderConfig>(res, "Failed to create provider config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerConfigs });
    },
  });
}

export function useProviderCredentialsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.providerCredentials,
    queryFn: async () => {
      const res = await fetch("/api/admin/provider-credentials");
      return parseEnvelope<ProviderCredential[]>(res, "Failed to fetch provider credentials");
    },
    retry: false,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreateProviderCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider_name: string;
      credential_name: string;
      value: string;
      environment: string;
      metadata_?: Record<string, unknown> | null;
    }) => {
      const res = await fetch("/api/admin/provider-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<ProviderCredential>(res, "Failed to create provider credential");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerCredentials });
    },
  });
}

export function useRotateProviderCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ credId, newValue }: { credId: string; newValue: string }) => {
      const res = await fetch(`/api/admin/provider-credentials/${credId}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_value: newValue }),
      });

      return parseEnvelope<ProviderCredential>(res, "Failed to rotate credential");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerCredentials });
    },
  });
}

export function useDeleteProviderCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credId: string) => {
      const res = await fetch(`/api/admin/provider-credentials/${credId}`, {
        method: "DELETE",
      });

      return parseEnvelope<ProviderCredential>(res, "Failed to delete credential");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerCredentials });
    },
  });
}

export function useDisableProviderCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credId: string) => {
      const res = await fetch(`/api/admin/provider-credentials/${credId}/disable`, {
        method: "POST",
      });

      return parseEnvelope<ProviderCredential>(res, "Failed to disable credential");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerCredentials });
    },
  });
}


async function fetchAdminUsage(params?: { start_date?: string; end_date?: string; user_id?: number }): Promise<AdminUsageData> {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.user_id) query.set("user_id", params.user_id.toString());
  const qs = query.toString();
  const queryString = qs ? "?" + qs : "";
  const res = await fetch(`/api/admin/analytics/usage${queryString}`);
  const data = (await res.json()) as ApiEnvelope<AdminUsageData>;
  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch admin usage"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }
  return data.data;
}

export function useAdminUsageQuery(params?: { start_date?: string; end_date?: string; user_id?: number }) {
  return useQuery({
    queryKey: queryKeys.admin.usage(params),
    queryFn: () => fetchAdminUsage(params),
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

async function fetchAdminRunAudit(analysisPublicId: string): Promise<AdminRunAuditData> {
  const res = await fetch(`/api/admin/analytics/runs/${analysisPublicId}/usage`);
  const data = (await res.json()) as ApiEnvelope<AdminRunAuditData>;
  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch admin run audit"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }
  return data.data;
}

export function useAdminRunAuditQuery(analysisPublicId: string) {
  return useQuery({
    queryKey: ["admin", "analytics", "runs", analysisPublicId, "usage"],
    queryFn: () => fetchAdminRunAudit(analysisPublicId),
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: Boolean(analysisPublicId),
  });
}
