# 03 - API Types, Query Keys, and View Models

## Tujuan
Membuat layer type dan mapping data yang stabil agar UI tidak bergantung pada detail backend yang tidak dijamin kontrak.

## Implementation Checklist
- Tambahkan common envelope: `ApiSuccess<T>`, `ApiError`, `ApiEnvelope<T>`, dan `ApiClientError`.
- Tambahkan auth types: `UserRole`, `LoginResponseData`, `MeResponseData`.
- Tambahkan analysis request types: `AnalysisGoal`, `CompanyType`, `ReportLanguage`, `ExternalAnalysisRequest`.
- Tambahkan analysis response types: `AnalysisScores`, `AnalysisSource`, `AnalysisDataGap`, `AnalysisReportSummary`, `AnalysisRunResult`, `AnalysisRunDetail`, `AnalysisReportDetail`.
- Pastikan `AnalysisReportSummary` memuat forecast fields:
  - `historical_3y_summary?: string | null`
  - `forecast_3y_summary?: string | null`
  - `forecast_confidence?: string | null`
  - `forecast_methods_used: string[]`
  - `scenario_highlights: string[]`
- Jadikan `id` pada `AnalysisSource` dan `AnalysisDataGap` optional atau jangan dipakai UI sebagai key.
- Tambahkan query key factory untuk auth, analysis, dan admin.
- Tambahkan view model mapper untuk overview analysis.

## Query Keys
```ts
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
```

## Contract Rules
- Route, query key, cache key, dan link detail wajib memakai `analysis_public_id`.
- UI structured memakai `report_summary`.
- Score card memakai `scores`.
- Source table memakai `sources`.
- Data gap list memakai `data_gaps`.
- Markdown hanya untuk display report, bukan sumber state UI.

## Acceptance Criteria
- TypeScript model sudah mencakup forecast terbaru.
- View model memakai fallback aman untuk nullable field.
- Source/data gap key tidak bergantung internal numeric id.
- Error model menyimpan `meta.request_id` untuk UI support/debug.
