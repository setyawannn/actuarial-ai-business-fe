# Frontend API Contract

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini adalah kontrak implementasi frontend untuk endpoint analysis pada Cubiconia Business Intelligence V1.

Frontend harus menganggap dokumen ini sebagai sumber utama untuk:
- shape response
- field yang aman dipakai di UI
- field yang hanya untuk tampilan detail
- alur fetch antar halaman

## 1. Prinsip Utama
- Gunakan `report_summary` untuk UI terstruktur.
- Gunakan `report_markdown` hanya untuk halaman detail report.
- Jangan parse markdown untuk membuat card, badge, score ring, atau table summary.
- Gunakan `sources` dan `data_gaps` langsung dari response analysis.
- Gunakan `meta.request_id` untuk debugging atau support log.

## 2. Endpoint yang Dipakai Frontend

### Run Analysis
```http
POST /api/v1/analysis/external/run
```

Tujuan:
- membuat analysis baru
- langsung mengembalikan hasil akhir synchronous

### Get Analysis Run
```http
GET /api/v1/analysis-runs/{analysis_public_id}
```

Tujuan:
- membaca metadata run
- cocok untuk halaman riwayat atau refresh status

### Get Analysis Report
```http
GET /api/v1/analysis-runs/{analysis_public_id}/report
```

Tujuan:
- mengambil `report_markdown`
- mengambil `report_summary`
- cocok untuk halaman detail report

### Get Analysis Sources
```http
GET /api/v1/analysis-runs/{analysis_public_id}/sources
```

Tujuan:
- mengambil daftar sumber yang dipakai
- cocok untuk tab `Sources`

## 3. Auth Requirement
Semua endpoint analysis membutuhkan:

```http
Authorization: Bearer <access_token>
```

Jika token invalid atau expired, frontend harus redirect ke login atau refresh token flow.

## 4. Request Shape
Payload untuk `POST /api/v1/analysis/external/run`:

```json
{
  "company_name": "PT Bank Central Asia Tbk",
  "legal_entity": "PT Bank Central Asia Tbk",
  "country": "Indonesia",
  "location": "Indonesia",
  "industry": "Banking",
  "ticker": "BBCA.JK",
  "website": "https://www.bca.co.id",
  "company_type": "public",
  "analysis_goal": "investment_risk",
  "language": "id",
  "target_context": {
    "currency": "IDR",
    "notes": "Analisis risiko investasi berbasis data publik."
  }
}
```

Required minimal fields:
- `company_name`
- `country`
- `industry`
- `analysis_goal`
- `language`

Enum yang aman dipakai frontend:

```ts
type AnalysisGoal =
  | "business_health"
  | "acquisition_risk"
  | "investment_risk"
  | "competitor_analysis"
  | "vendor_risk"
  | "market_entry"
  | "partnership_risk";

type CompanyType = "private" | "public" | "unknown";
type ReportLanguage = "id" | "en";
```

## 5. Success Envelope
Semua success response analysis memakai envelope:

```json
{
  "success": true,
  "code": "ANALYSIS_COMPLETED",
  "message": "External company analysis completed successfully.",
  "data": {},
  "meta": {
    "request_id": "req_xxx"
  },
  "errors": null
}
```

Frontend harus:
- cek `success === true`
- baca payload utama dari `data`
- simpan `meta.request_id` jika perlu

## 6. Main Analysis Response Shape
Response utama frontend-ready:

```ts
type AnalysisResponse = {
  success: true;
  code: "ANALYSIS_COMPLETED";
  message: string;
  data: {
    analysis_public_id: string;
    status: "completed";
    scores: {
      overall_risk_score: number | null;
      confidence_score: number | null;
      data_availability_score: number | null;
    };
    report_markdown: string;
    report_summary: {
      company_name: string;
      analysis_goal: string;
      language: string;
      overall_conclusion: string;
      overall_risk_level: string;
      overall_risk_score: number | null;
      confidence_score: number | null;
      data_availability_score: number | null;
      data_confidence: string;
      top_findings: string[];
      top_risks: string[];
      key_limitations: string[];
      recommendations: string[];
      data_requests: string[];
      next_steps: string[];
    };
    sources: SourceItem[];
    data_gaps: DataGapItem[];
  };
  meta: {
    request_id: string;
  };
  errors: null;
};
```

Supporting types:

```ts
type SourceItem = {
  id: string;
  title: string | null;
  url: string;
  domain: string | null;
  source_type: string | null;
  credibility_score: number | null;
  relevance_score: number | null;
  raw_snippet: string | null;
};

type DataGapItem = {
  id: string;
  missing_item: string;
  importance: string | null;
  reason: string | null;
  recommended_action: string | null;
};
```

## 7. Field Mapping for Frontend

### A. Overview Card
Gunakan:
- `data.report_summary.company_name`
- `data.report_summary.analysis_goal`
- `data.status`

### B. Score Cards
Gunakan:
- `data.scores.overall_risk_score`
- `data.scores.confidence_score`
- `data.scores.data_availability_score`

Jangan ambil score dari markdown.

### C. Risk Badge
Gunakan:
- `data.report_summary.overall_risk_level`

Contoh mapping:
- `low` -> hijau
- `medium` -> kuning
- `medium_high` -> oranye
- `high` -> merah
- `unknown` -> abu-abu

### D. Summary Panel
Gunakan:
- `data.report_summary.overall_conclusion`
- `data.report_summary.top_findings`
- `data.report_summary.top_risks`

### E. Recommendation Panel
Gunakan:
- `data.report_summary.recommendations`
- `data.report_summary.next_steps`

### F. Limitation Panel
Gunakan:
- `data.report_summary.key_limitations`
- `data.data_gaps`

### G. Source Table
Gunakan:
- `data.sources`

Kolom yang direkomendasikan:
- `title`
- `domain`
- `source_type`
- `credibility_score`
- `url`

### H. Full Report View
Gunakan:
- `data.report_markdown`

Render sebagai markdown display-only.

## 8. Detail Report Endpoint Shape
Untuk `GET /api/v1/analysis-runs/{analysis_public_id}/report`:

```ts
type AnalysisReportResponse = {
  success: true;
  code: string;
  message: string;
  data: {
    analysis_public_id: string;
    status: string;
    report_markdown: string;
    report_summary: {
      company_name: string;
      analysis_goal?: string;
      overall_conclusion?: string;
      overall_risk_level?: string;
    } | null;
  };
  meta: {
    request_id: string;
  };
  errors: null;
};
```

## 9. Get Run Endpoint Shape
Untuk `GET /api/v1/analysis-runs/{analysis_public_id}`:

```ts
type AnalysisRunDetailResponse = {
  success: true;
  code: string;
  message: string;
  data: {
    id: string;
    company_id: string;
    analysis_mode: string;
    analysis_goal: string;
    language: string;
    status: string;
    progress: number;
    data_availability_score: number | null;
    confidence_score: number | null;
    overall_risk_score: number | null;
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
  };
  meta: {
    request_id: string;
  };
  errors: null;
};
```

Frontend paling cocok memakai endpoint ini untuk:
- refresh status
- list riwayat
- polling bila nanti ada mode async

## 10. Error Envelope
Semua error memakai shape:

```ts
type ErrorResponse = {
  success: false;
  code: string;
  message: string;
  data: null;
  meta: {
    request_id: string;
    analysis_public_id?: string;
  };
  errors: Array<{
    field: string | null;
    message: string;
    type: string;
  }>;
};
```

Contoh code yang perlu ditangani frontend:
- `VALIDATION_ERROR`
- `PROMPT_RENDER_ERROR`
- `PROMPT_OUTPUT_VALIDATION_ERROR`
- `LLM_PROVIDER_ERROR`
- `TAVILY_PROVIDER_ERROR`
- `ANALYSIS_NOT_FOUND`
- `INTERNAL_SERVER_ERROR`

## 11. Frontend Handling Rules
- Jangan parse angka penting dari markdown.
- Gunakan `report_summary` sebagai source of truth untuk summary UI.
- Gunakan `scores` sebagai source of truth untuk semua score card.
- Gunakan `sources` sebagai source of truth untuk source tab.
- Gunakan `data_gaps` sebagai source of truth untuk gap tab.
- Gunakan `report_markdown` hanya untuk reader/detail page.
- Jika `report_summary` kosong atau null, tampilkan fallback kosong dan tetap render markdown.

## 12. Suggested Screen Mapping

### Analysis Form Page
Call:
- `POST /api/v1/analysis/external/run`

### Analysis Result Overview Page
Use from response:
- `scores`
- `report_summary`
- `data_gaps`

### Analysis Report Page
Call:
- `GET /api/v1/analysis-runs/{analysis_public_id}/report`

Use:
- `report_markdown`
- `report_summary`

### Analysis Sources Page
Call:
- `GET /api/v1/analysis-runs/{analysis_public_id}/sources`

Use:
- `sources`

## 13. Example Frontend Extraction
Minimal object yang aman untuk state frontend:

```ts
type AnalysisViewModel = {
  id: string;
  status: string;
  companyName: string;
  analysisGoal: string;
  overallRiskScore: number | null;
  confidenceScore: number | null;
  dataAvailabilityScore: number | null;
  riskLevel: string;
  conclusion: string;
  topFindings: string[];
  topRisks: string[];
  recommendations: string[];
  limitations: string[];
  sources: SourceItem[];
  dataGaps: DataGapItem[];
  reportMarkdown: string;
};
```

## 14. Non-Contract Fields
Frontend tidak boleh mengandalkan:
- wording exact di dalam markdown
- urutan bullet di markdown
- heading parsing dari markdown
- appendix JSON yang tertanam di markdown

Field-field itu boleh berubah tanpa mengubah contract utama frontend.
