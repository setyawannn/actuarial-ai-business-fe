import {
  PromptTemplate,
  PromptTemplateVersion,
  PromptVariableDefinition,
} from "@/types/api";

export interface PromptVariable {
  key: string;
  token: string;
  label: string;
  description: string;
  source: "schema" | "system";
}

const SYSTEM_VARIABLES: PromptVariable[] = [
  {
    key: "company_name",
    token: "{{company_name}}",
    label: "Company name",
    description: "Nama perusahaan yang sedang dianalisis.",
    source: "system",
  },
  {
    key: "legal_entity",
    token: "{{legal_entity}}",
    label: "Legal entity",
    description: "Nama badan hukum bila tersedia.",
    source: "system",
  },
  {
    key: "industry",
    token: "{{industry}}",
    label: "Industry",
    description: "Industri utama perusahaan.",
    source: "system",
  },
  {
    key: "country",
    token: "{{country}}",
    label: "Country",
    description: "Negara target analisis.",
    source: "system",
  },
  {
    key: "location",
    token: "{{location}}",
    label: "Location",
    description: "Lokasi atau wilayah fokus perusahaan.",
    source: "system",
  },
  {
    key: "analysis_goal",
    token: "{{analysis_goal}}",
    label: "Analysis goal",
    description: "Tujuan analisis seperti business_health atau acquisition_risk.",
    source: "system",
  },
  {
    key: "language",
    token: "{{language}}",
    label: "Language",
    description: "Bahasa keluaran prompt.",
    source: "system",
  },
  {
    key: "target_context",
    token: "{{target_context}}",
    label: "Target context",
    description: "Konteks tambahan dari request user.",
    source: "system",
  },
];

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSchemaVariables(schema: Record<string, unknown> | null | undefined) {
  if (!schema || typeof schema !== "object") return [];

  const properties =
    "properties" in schema && schema.properties && typeof schema.properties === "object"
      ? (schema.properties as Record<string, unknown>)
      : null;

  if (!properties) return [];

  return Object.entries(properties).map(([key, value]) => {
    const description =
      value && typeof value === "object" && "description" in value && typeof value.description === "string"
        ? value.description
        : `Variable ${titleCase(key)} dari input schema.`;

    return {
      key,
      token: `{{${key}}}`,
      label: titleCase(key),
      description,
      source: "schema" as const,
    };
  });
}

export function getPromptVariables(template: PromptTemplate | null, version: PromptTemplateVersion | null) {
  const schemaVariables = [
    ...getSchemaVariables(version?.input_schema),
    ...getSchemaVariables(template?.versions.find((item) => item.id === template?.active_version_id)?.input_schema),
  ];

  const map = new Map<string, PromptVariable>();

  for (const variable of [...SYSTEM_VARIABLES, ...schemaVariables]) {
    if (!map.has(variable.key)) {
      map.set(variable.key, variable);
    }
  }

  return Array.from(map.values());
}

export function mergePromptVariables(
  inferredVariables: PromptVariable[],
  backendVariables: PromptVariableDefinition[] | null | undefined
) {
  const map = new Map<string, PromptVariable>();

  for (const variable of inferredVariables) {
    map.set(variable.key, variable);
  }

  for (const variable of backendVariables ?? []) {
    map.set(variable.key, {
      key: variable.key,
      token: variable.token,
      label: variable.label,
      description: variable.description ?? "Variable dari backend catalog.",
      source: variable.source === "schema" ? "schema" : "system",
    });
  }

  return Array.from(map.values());
}

export function getPromptTokens(content: string) {
  const matches = content.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) ?? [];
  return Array.from(new Set(matches));
}

export function getPromptVersionStatusLabel(
  status: string | null | undefined,
  isDraft?: boolean,
  isActive?: boolean
) {
  if (isActive) return "Active";
  if (isDraft || status === "draft") return "Draft";
  if (!status) return "Unknown";

  const map: Record<string, string> = {
    archived: "Archived",
    deprecated: "Deprecated",
    inactive: "Inactive",
    ready: "Ready",
  };

  return map[status] ?? status.replace(/[_-]+/g, " ");
}

export function getPromptVersionStatusDescription(
  status: string | null | undefined,
  isDraft?: boolean,
  isActive?: boolean
) {
  if (isActive) {
    return "Versi ini sedang dipakai aplikasi saat ini.";
  }

  if (isDraft || status === "draft") {
    return "Versi kerja yang masih aman untuk diedit sebelum diaktifkan.";
  }

  if (status === "ready") {
    return "Versi ini siap direview atau dijadikan dasar versi baru.";
  }

  if (status === "archived") {
    return "Versi lama yang disimpan untuk referensi, bukan untuk dipakai aktif.";
  }

  return "Status versi ini dikirim dari backend dan tetap bisa direview dari editor.";
}

export function resolvePublishedVersion(template: PromptTemplate | null) {
  if (!template) return null;
  if (template.active_version) return template.active_version;

  if (template.active_version_id) {
    return template.versions.find((item) => item.id === template.active_version_id) ?? null;
  }

  return null;
}

export function resolveWorkingDraft(template: PromptTemplate | null) {
  if (!template) return null;
  if (template.working_draft) return template.working_draft;

  const editableDraft =
    template.versions.find(
      (item) => item.id !== template.active_version_id && (item.is_draft === true || item.status === "draft")
    ) ?? null;

  if (editableDraft) return editableDraft;

  return resolvePublishedVersion(template);
}
