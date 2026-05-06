# UI Integration Guide

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini menjelaskan bagaimana backend contract dipetakan ke UI Next.js.

## 1. Recommended Pages
- `/login`
- `/analysis/new`
- `/analysis/[id]`
- `/analysis/[id]/report`
- `/analysis/[id]/sources`
- `/admin/prompts`
- `/admin/providers`

## 2. Recommended State Shape
Frontend sebaiknya membentuk view model sendiri dari response backend.

Contoh:
```ts
export type AnalysisOverviewVM = {
  id: string;
  companyName: string;
  analysisGoal: string;
  status: string;
  overallRiskScore: number | null;
  confidenceScore: number | null;
  dataAvailabilityScore: number | null;
  riskLevel: string;
  conclusion: string;
  findings: string[];
  recommendations: string[];
  limitations: string[];
};
```

## 3. Mapping Rules

### Overview Header
Use:
- `report_summary.company_name`
- `report_summary.analysis_goal`
- `status`

### KPI Cards
Use:
- `scores.overall_risk_score`
- `scores.confidence_score`
- `scores.data_availability_score`

### Summary Block
Use:
- `report_summary.overall_conclusion`
- `report_summary.top_findings`

### Recommendation Block
Use:
- `report_summary.recommendations`
- `report_summary.next_steps`

### Limitation Block
Use:
- `report_summary.key_limitations`
- `data_gaps`

### Source Table
Use:
- `sources`

### Full Report
Use:
- `report_markdown`

## 4. Fetch Strategy

### On Submit Analysis Form
Call:
- `POST /api/v1/analysis/external/run`

Then:
- simpan seluruh response ke local state
- redirect ke `/analysis/[id]`

### On Overview Page Reload
Call:
- `GET /api/v1/analysis-runs/{analysis_public_id}`
- optionally `GET /api/v1/analysis-runs/{analysis_public_id}/report`

### On Report Page
Call:
- `GET /api/v1/analysis-runs/{analysis_public_id}/report`

### On Sources Page
Call:
- `GET /api/v1/analysis-runs/{analysis_public_id}/sources`

## 5. Error Handling Strategy
- tampilkan `message` dari error envelope
- log `meta.request_id`
- jika ada `meta.analysis_public_id`, tampilkan di error panel atau support info
- jika `401`, redirect ke login atau jalankan refresh flow

## 6. What Not To Do
- jangan parse markdown untuk score
- jangan infer risk level dari teks report
- jangan assume urutan bullet di markdown stabil
- jangan assume semua endpoint list sudah paginated
