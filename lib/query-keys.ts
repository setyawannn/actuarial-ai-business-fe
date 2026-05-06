export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  analysis: {
    all: ["analysis"] as const,
    history: (params?: Record<string, unknown>) =>
      ["analysis", "history", params ?? {}] as const,
    detail: (analysisPublicId: string) =>
      ["analysis", "detail", analysisPublicId] as const,
    report: (analysisPublicId: string) =>
      ["analysis", "report", analysisPublicId] as const,
    sources: (analysisPublicId: string) =>
      ["analysis", "sources", analysisPublicId] as const,
  },
  admin: {
    promptTemplates: ["admin", "prompt-templates"] as const,
    providerConfigs: ["admin", "provider-configs"] as const,
    providerCredentials: ["admin", "provider-credentials"] as const,
  },
};
