# Cubiconia Business Intelligence - Frontend Architecture V1

## 1. Tujuan Dokumen

Dokumen ini adalah arsitektur frontend terbaru untuk **Cubiconia Business Intelligence V1** berdasarkan kontrak backend frontend delivery pack terbaru.

Frontend stack:

```text
Framework       : Next.js App Router
Language        : TypeScript
UI              : shadcn/ui
Styling         : Tailwind CSS
Server State    : TanStack Query
Form            : React Hook Form + Zod
Auth            : JWT Bearer Token via Next.js BFF route handlers
Report Viewer   : react-markdown + remark-gfm
Backend         : FastAPI
```

Output utama V1:

```text
Structured analysis response
+ text/markdown report
+ source table
+ data gaps
+ forecast summary
+ scenario highlights
```

---

## 2. Kontrak Backend yang Wajib Diikuti

Frontend harus mengikuti baseline terbaru:

```text
- Frontend hanya memakai analysis_public_id untuk analysis resources.
- analysis_public_id berbentuk anl_<random>.
- Analysis private milik creator.
- Admin tidak bisa membaca analysis milik user lain.
- History screen harus load dari GET /api/v1/analysis-runs.
- GET /api/v1/analysis-runs hanya mengembalikan caller-owned rows.
- Non-owner detail/report/sources reads return 404 ANALYSIS_NOT_FOUND.
```

Source of truth UI:

```text
Overview / summary     : report_summary
Score cards            : scores
Sources                : sources
Data gaps              : data_gaps
Full report            : report_markdown
Forecast UI            : report_summary forecast fields
```

Larangan utama:

```text
- Jangan pakai internal analysis id untuk route detail.
- Jangan parse markdown untuk score, risk badge, summary card, source table, atau data gap.
- Jangan assume admin bisa melihat analysis user lain.
- Jangan bergantung pada internal numeric id untuk source/data gap rendering key.
```

---

## 3. Perubahan Penting dari Kontrak Terbaru

### 3.1 analysis_public_id

Semua route detail analysis wajib memakai:

```text
analysis_public_id
```

Bukan:

```text
analysis_run_id
internal id
database id
```

Frontend route:

```text
/analysis/[analysisPublicId]
/analysis/[analysisPublicId]/report
/analysis/[analysisPublicId]/sources
```

---

### 3.2 History Screen

History screen wajib fetch dari:

```http
GET /api/v1/analysis-runs
```

Frontend BFF route:

```http
GET /api/analysis/runs
```

History hanya berisi analysis milik user yang sedang login.

---

### 3.3 Forecast Additions

`report_summary` sekarang punya tambahan field forecast:

```ts
historical_3y_summary?: string | null;
forecast_3y_summary?: string | null;
forecast_confidence?: string | null;
forecast_methods_used: string[];
scenario_highlights: string[];
```

UI harus menampilkan:

```text
- 3-year historical summary
- 3-year forecast summary
- forecast confidence
- forecast methods used
- scenario highlights
```

Jika `forecast_confidence` bernilai:

```text
Low
Unknown
partial
insufficient
```

maka frontend harus menandai forecast sebagai:

```text
qualitative guidance, not precise prediction
```

---

### 3.4 Source and Data Gap Rendering Key

Kontrak terbaru menyatakan:

```text
sources dan data_gaps tidak mengekspos internal numeric IDs.
source raw_snippet capped at 800 characters.
```

Frontend rule:

```text
- Untuk source rendering key, gunakan url + index, atau title + url + index.
- Untuk data gap rendering key, gunakan missing_item + index.
- Jangan bergantung pada internal numeric id.
```

---

## 4. Recommended Pages

Wajib:

```text
/login
/dashboard
/analysis/new
/analysis/history
/analysis/[analysisPublicId]
/analysis/[analysisPublicId]/report
/analysis/[analysisPublicId]/sources
```

Opsional admin:

```text
/admin/prompts
/admin/providers
```

Catatan:

```text
Admin page hanya untuk prompt/provider management.
Admin tidak punya cross-user analysis viewer.
```

---

## 5. App Route Structure

```text
src/
  app/
    layout.tsx
    globals.css
    providers.tsx

    (auth)/
      login/
        page.tsx

    (app)/
      layout.tsx

      dashboard/
        page.tsx

      analysis/
        new/
          page.tsx

        history/
          page.tsx

        [analysisPublicId]/
          page.tsx

          report/
            page.tsx

          sources/
            page.tsx

    admin/
      prompts/
        page.tsx

      providers/
        page.tsx

    api/
      auth/
        login/
          route.ts
        refresh/
          route.ts
        logout/
          route.ts
        me/
          route.ts

      analysis/
        external/
          run/
            route.ts

        runs/
          route.ts

          [analysisPublicId]/
            route.ts

            report/
              route.ts

            sources/
              route.ts

      admin/
        prompt-templates/
          route.ts

        provider-configs/
          route.ts

        provider-credentials/
          route.ts
```

---

## 6. Backend Endpoint Mapping

### 6.1 Auth

Backend:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

Frontend BFF:

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

---

### 6.2 Analysis User Endpoints

Backend canonical:

```http
POST /api/v1/analysis/external/run
GET  /api/v1/analysis-runs
GET  /api/v1/analysis-runs/{analysis_public_id}
GET  /api/v1/analysis-runs/{analysis_public_id}/report
GET  /api/v1/analysis-runs/{analysis_public_id}/sources
```

Frontend BFF:

```http
POST /api/analysis/external/run
GET  /api/analysis/runs
GET  /api/analysis/runs/{analysisPublicId}
GET  /api/analysis/runs/{analysisPublicId}/report
GET  /api/analysis/runs/{analysisPublicId}/sources
```

Compatibility aliases exist in backend, but frontend should use canonical `/api/v1/analysis-runs`.

---

### 6.3 Admin Endpoints

Prompt templates:

```http
GET   /api/v1/prompt-templates
POST  /api/v1/prompt-templates
GET   /api/v1/prompt-templates/{template_id}
PATCH /api/v1/prompt-templates/{template_id}
POST  /api/v1/prompt-templates/{template_id}/versions
POST  /api/v1/prompt-templates/{template_id}/versions/{version_id}/activate
```

Provider config and credentials:

```http
GET  /api/v1/admin/provider-configs
POST /api/v1/admin/provider-configs
GET  /api/v1/admin/provider-credentials
POST /api/v1/admin/provider-credentials
POST /api/v1/admin/provider-credentials/{cred_id}/rotate
POST /api/v1/admin/provider-credentials/{cred_id}/disable
```

---

## 7. High-Level Frontend Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  |-- Server Components by default
  |-- Client Components for forms/query/tabs/toasts
  |-- Middleware auth guard
  |-- TanStack Query Provider
  |-- Route Handlers as BFF
  |
  v
Next.js API Route Handlers
  |
  |-- read httpOnly cookies
  |-- attach Authorization: Bearer <access_token>
  |-- proxy to FastAPI
  |-- try refresh on 401
  |-- retry original request once
  |-- return backend envelope
  |
  v
FastAPI Backend
```

Decision:

```text
Client-side code calls only Next.js internal API routes.
FastAPI is called from Next.js route handlers.
JWT tokens are stored in httpOnly cookies, not localStorage.
```

---

## 8. Auth Architecture

### 8.1 Token Storage

Use:

```text
access_token  : httpOnly secure cookie
refresh_token : httpOnly secure cookie
```

Do not use:

```text
localStorage
sessionStorage
client-readable token state
```

Cookie flags:

```text
httpOnly: true
secure: true in production
sameSite: lax
path: /
```

---

### 8.2 Login Flow

```text
/login
→ POST /api/auth/login
→ Next route handler calls POST /api/v1/auth/login
→ backend returns access_token + refresh_token + user
→ route handler stores tokens in httpOnly cookies
→ route handler returns user object only
→ client redirects to /analysis/new
```

---

### 8.3 Session Restore

```text
GET /api/auth/me
→ Next route handler attaches Bearer token
→ FastAPI GET /api/v1/auth/me
→ returns current user
```

TanStack Query key:

```ts
queryKeys.auth.me
```

---

### 8.4 Refresh Flow

On 401 from FastAPI:

```text
1. Next route handler tries POST /api/v1/auth/refresh.
2. If refresh succeeds, update access token cookie.
3. Retry original request once.
4. If refresh fails, clear cookies and return 401.
5. Client redirects to /login.
```

---

### 8.5 Role Rules

Roles:

```text
admin
user
```

Rules:

```text
- admin can access prompt/provider admin endpoints.
- user can access normal analysis endpoints.
- admin cannot read another user's analysis.
- history page only shows caller-owned rows.
```

---

## 9. TypeScript Models

### 9.1 Envelope

```ts
export type ApiSuccess<T> = {
  success: true;
  code: string;
  message: string;
  data: T;
  meta: {
    request_id: string;
    page?: number;
    page_size?: number;
    total?: number;
    total_pages?: number;
    analysis_public_id?: string;
  };
  errors: null;
};

export type ApiError = {
  success: false;
  code: string;
  message: string;
  data: null;
  meta: {
    request_id: string;
    analysis_public_id?: string;
    page?: number;
    page_size?: number;
    total?: number;
    total_pages?: number;
  };
  errors: Array<{
    field: string | null;
    message: string;
    type: string;
  }>;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;
```

---

### 9.2 Auth

```ts
export type UserRole = "admin" | "user";

export type LoginResponseData = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
  };
};

export type MeResponseData = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
};
```

---

### 9.3 Analysis Request

```ts
export type AnalysisGoal =
  | "business_health"
  | "acquisition_risk"
  | "investment_risk"
  | "competitor_analysis"
  | "vendor_risk"
  | "market_entry"
  | "partnership_risk";

export type CompanyType = "private" | "public" | "unknown";
export type ReportLanguage = "id" | "en";

export type ExternalAnalysisRequest = {
  company_name: string;
  legal_entity?: string | null;
  country: string;
  location?: string | null;
  industry: string;
  ticker?: string | null;
  website?: string | null;
  company_type?: CompanyType;
  analysis_goal: AnalysisGoal;
  language: ReportLanguage;
  target_context?: Record<string, unknown>;
};
```

---

### 9.4 Analysis Response

```ts
export type AnalysisScores = {
  overall_risk_score: number | null;
  confidence_score: number | null;
  data_availability_score: number | null;
};

export type AnalysisSource = {
  id?: string;
  title: string | null;
  url: string;
  domain: string | null;
  source_type: string | null;
  credibility_score: number | null;
  relevance_score: number | null;
  raw_snippet: string | null;
};

export type AnalysisDataGap = {
  id?: string;
  missing_item: string;
  importance: string | null;
  reason: string | null;
  recommended_action: string | null;
};

export type AnalysisReportSummary = {
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

  historical_3y_summary?: string | null;
  forecast_3y_summary?: string | null;
  forecast_confidence?: string | null;
  forecast_methods_used: string[];
  scenario_highlights: string[];
};

export type AnalysisRunResult = {
  analysis_public_id: string;
  status: string;
  scores: AnalysisScores;
  report_markdown: string;
  report_summary: AnalysisReportSummary;
  sources: AnalysisSource[];
  data_gaps: AnalysisDataGap[];
};

export type AnalysisRunDetail = {
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

export type AnalysisReportDetail = {
  analysis_public_id: string;
  status: string;
  report_markdown: string;
  report_summary: AnalysisReportSummary | null;
};
```

Note:

```text
Although older snippets may show id in Source/DataGap, UI must not depend on internal numeric IDs.
Use id only if present and public-safe; otherwise build stable rendering key from content + index.
```

---

## 10. View Models

### 10.1 Analysis Overview VM

```ts
export type AnalysisOverviewVM = {
  id: string;
  analysisPublicId: string;
  companyName: string;
  analysisGoal: string;
  status: string;

  overallRiskScore: number | null;
  confidenceScore: number | null;
  dataAvailabilityScore: number | null;
  riskLevel: string;
  conclusion: string;

  findings: string[];
  risks: string[];
  recommendations: string[];
  limitations: string[];
  dataRequests: string[];
  nextSteps: string[];

  historical3ySummary: string | null;
  forecast3ySummary: string | null;
  forecastConfidence: string | null;
  forecastMethodsUsed: string[];
  scenarioHighlights: string[];
};
```

Mapping:

```text
analysisPublicId        = analysis_public_id
id                      = analysis_public_id
companyName             = report_summary.company_name
analysisGoal            = report_summary.analysis_goal
status                  = status
overallRiskScore        = scores.overall_risk_score
confidenceScore         = scores.confidence_score
dataAvailabilityScore   = scores.data_availability_score
riskLevel               = report_summary.overall_risk_level
conclusion              = report_summary.overall_conclusion
findings                = report_summary.top_findings
risks                   = report_summary.top_risks
recommendations         = report_summary.recommendations
limitations             = report_summary.key_limitations
dataRequests            = report_summary.data_requests
nextSteps               = report_summary.next_steps
historical3ySummary     = report_summary.historical_3y_summary ?? null
forecast3ySummary       = report_summary.forecast_3y_summary ?? null
forecastConfidence      = report_summary.forecast_confidence ?? null
forecastMethodsUsed     = report_summary.forecast_methods_used ?? []
scenarioHighlights      = report_summary.scenario_highlights ?? []
```

---

## 11. Forecast UI Rules

### 11.1 Forecast Cards

Add forecast section to `/analysis/[analysisPublicId]`.

Recommended cards:

```text
- Historical 3-Year Summary
- Forecast 3-Year Summary
- Forecast Confidence
- Forecast Methods Used
- Scenario Highlights
```

### 11.2 Forecast Confidence Logic

Treat forecast as qualitative if confidence is:

```text
low
unknown
partial
insufficient
```

Case-insensitive check.

UI label:

```text
Forecast ini bersifat kualitatif karena confidence rendah/terbatas.
```

Do not present forecast as precise prediction when confidence is low/unknown/partial/insufficient.

### 11.3 Scenario Highlights

Use:

```text
report_summary.scenario_highlights
```

Render as cards/list.

Do not invent scenario labels if backend does not provide them.

---

## 12. TanStack Query Architecture

### 12.1 Query Client

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

### 12.2 Query Keys

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

---

### 12.3 Cache Strategy

Auth Me:

```text
staleTime: 5 minutes
gcTime: 30 minutes
```

Analysis History:

```text
staleTime: 30 seconds
gcTime: 10 minutes
```

Analysis Detail:

```text
running status: staleTime 30 seconds
completed status: staleTime 10 minutes
gcTime: 30 minutes
```

Analysis Report:

```text
staleTime: 30 minutes or Infinity
gcTime: 60 minutes
```

Analysis Sources:

```text
staleTime: 30 minutes
gcTime: 60 minutes
```

Admin Data:

```text
staleTime: 1 minute
gcTime: 10 minutes
```

---

### 12.4 Mutation Strategy

Login:

```text
useLoginMutation
→ POST /api/auth/login
→ route handler sets cookies
→ invalidate auth.me
→ redirect /analysis/new
```

Run Analysis:

```text
useRunExternalAnalysisMutation
→ POST /api/analysis/external/run
→ onSuccess:
   - const id = data.analysis_public_id
   - setQueryData(queryKeys.analysis.report(id), report payload)
   - setQueryData(queryKeys.analysis.sources(id), sources payload)
   - optionally setQueryData(queryKeys.analysis.detail(id), compatible detail payload)
   - invalidate queryKeys.analysis.history()
   - redirect /analysis/${id}
```

Important:

```text
Do not use analysis_run_id.
Do not use internal id for query key.
Use analysis_public_id only.
```

---

## 13. API Client and BFF Strategy

### 13.1 Client Calls

Client components call only internal API routes:

```text
/api/auth/login
/api/auth/me
/api/analysis/external/run
/api/analysis/runs
/api/analysis/runs/{analysisPublicId}
/api/analysis/runs/{analysisPublicId}/report
/api/analysis/runs/{analysisPublicId}/sources
```

Do not call FastAPI directly from browser components.

---

### 13.2 Route Handler Responsibilities

```text
- read httpOnly access token cookie
- attach Authorization: Bearer <access_token>
- forward request to FastAPI
- try refresh on 401
- retry original request once
- return backend envelope unchanged if possible
```

---

## 14. Form Architecture

Use:

```text
React Hook Form
Zod
shadcn/ui Form
```

Schema:

```ts
const externalAnalysisSchema = z.object({
  company_name: z.string().min(2),
  legal_entity: z.string().optional().nullable(),
  country: z.string().min(2),
  location: z.string().optional().nullable(),
  industry: z.string().min(2),
  ticker: z.string().optional().nullable(),
  website: z.string().url().optional().or(z.literal("")),
  company_type: z.enum(["private", "public", "unknown"]).default("unknown"),
  analysis_goal: z.enum([
    "business_health",
    "acquisition_risk",
    "investment_risk",
    "competitor_analysis",
    "vendor_risk",
    "market_entry",
    "partnership_risk",
  ]),
  language: z.enum(["id", "en"]).default("id"),
  target_context: z.object({
    currency: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});
```

---

## 15. UI Components

### 15.1 shadcn/ui Components

Install:

```text
button
card
input
textarea
select
form
badge
alert
tabs
table
separator
skeleton
dialog
dropdown-menu
toast / sonner
scroll-area
tooltip
progress
```

---

### 15.2 Layout Components

```text
AppShell
AppSidebar
TopNav
PageHeader
ProtectedPage
AdminOnly
```

---

### 15.3 Analysis Components

```text
AnalysisForm
AnalysisLoading
AnalysisHeader
ScoreCards
RiskBadge
ExecutiveSummaryCard
FindingsCard
TopRisksCard
RecommendationsCard
LimitationsCard
ForecastSummaryCards
ScenarioHighlights
DataGapList
SourceTable
MarkdownReport
AnalysisHistoryTable
```

---

### 15.4 Error Components

```text
ApiErrorAlert
FieldErrorList
RequestIdBadge
NotFoundState
UnauthorizedState
```

---

## 16. Page-Level Data Requirements

### `/login`

Uses:

```text
POST /api/auth/login
```

---

### `/analysis/new`

Uses:

```text
POST /api/analysis/external/run
```

On success:

```text
- read analysis_public_id
- cache report/sources
- redirect /analysis/[analysisPublicId]
```

---

### `/analysis/history`

Uses:

```text
GET /api/analysis/runs
```

Render caller-owned rows only.

---

### `/analysis/[analysisPublicId]`

Primary:

```text
Use mutation cache if available.
```

On reload:

```text
GET /api/analysis/runs/{analysisPublicId}
GET /api/analysis/runs/{analysisPublicId}/report
```

---

### `/analysis/[analysisPublicId]/report`

Uses:

```text
GET /api/analysis/runs/{analysisPublicId}/report
```

Render:

```text
report_markdown
report_summary
```

---

### `/analysis/[analysisPublicId]/sources`

Uses:

```text
GET /api/analysis/runs/{analysisPublicId}/sources
```

Render:

```text
sources
```

---

## 17. Source and Data Gap Rendering Keys

### Source Key

Use:

```ts
const sourceKey = `${source.url}-${index}`;
```

Fallback:

```ts
const sourceKey = `${source.title ?? "source"}-${index}`;
```

Do not rely on numeric internal id.

---

### Data Gap Key

Use:

```ts
const gapKey = `${gap.missing_item}-${index}`;
```

Do not rely on numeric internal id.

---

## 18. Error Handling

All backend errors use envelope:

```ts
type ApiError = {
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

UI rules:

```text
- show error.message
- show first error item if available
- show request_id for support/debug
- if code === ANALYSIS_NOT_FOUND, show not found state
- if HTTP 401, route handler should refresh or client redirects /login
```

Important:

```text
Non-owner analysis reads return 404 ANALYSIS_NOT_FOUND.
Treat as not found, not permission/admin issue.
```

---

## 19. Markdown Rendering

Use:

```text
react-markdown
remark-gfm
```

Rules:

```text
- report_markdown is display-only.
- Do not execute raw HTML.
- Do not use rehype-raw.
- Do not parse markdown to create UI state.
```

---

## 20. Performance and Build Optimization

### 20.1 Server Components First

Use Server Components by default.

Client components only for:

```text
- forms
- TanStack Query hooks
- tabs
- toasts
- admin editors
```

---

### 20.2 Dynamic Imports

Use dynamic import for heavier components:

```text
MarkdownReport
AdminPromptEditor
ProviderCredentialDialog
Future chart components
```

---

### 20.3 Avoid Heavy Packages

Use:

```text
lucide-react
react-markdown
remark-gfm
zod
react-hook-form
@tanstack/react-query
```

Avoid initially:

```text
large chart libraries
monaco editor
moment.js
full lodash import
heavy table libraries unless needed
syntax highlighters
```

---

### 20.4 Bundle Analyzer

Add optional script:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

---

### 20.5 Next Config

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-markdown"
    ],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
```

---

### 20.6 Avoid Over-Fetching

Rules:

```text
- Do not refetch report immediately after run analysis success.
- Use queryClient.setQueryData after POST response.
- Fetch sources only on sources page/tab.
- Fetch report only on report page or reload.
- History screen should use GET /api/v1/analysis-runs.
```

---

## 21. Environment Variables

Frontend env:

```env
NEXT_PUBLIC_APP_NAME=Cubiconia Business Intelligence
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_API_BASE_URL=http://localhost:8000
APP_ENV=development
```

Never expose:

```text
LLM keys
Tavily keys
JWT secret
provider credentials
backend provider keys
```

Only `NEXT_PUBLIC_*` variables are exposed to browser.

---

## 22. Recommended Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "latest",
    "@hookform/resolvers": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-hook-form": "latest",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    "sonner": "latest",
    "tailwind-merge": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest",
    "tailwindcss": "latest"
  }
}
```

Pin versions during actual implementation.

---

## 23. Implementation Plan

### Phase 1 - Project Setup

```text
- Create Next.js TypeScript app
- Install Tailwind CSS
- Install shadcn/ui
- Setup path alias @/*
- Setup base layout
- Setup providers.tsx
```

---

### Phase 2 - API Envelope + Route Handlers

```text
- Add ApiSuccess / ApiError types
- Add ApiClientError
- Add backend proxy helper
- Add route handlers for auth/login, auth/me, auth/refresh
- Add route handlers for analysis endpoints
```

---

### Phase 3 - Auth

```text
- Build /login
- Store tokens in httpOnly cookies
- Implement /api/auth/me
- Add middleware
- Add useMe query
```

---

### Phase 4 - Analysis Form

```text
- Build /analysis/new
- Use Zod + React Hook Form
- Submit external analysis
- Cache result using analysis_public_id
```

---

### Phase 5 - Result Overview

```text
- Build /analysis/[analysisPublicId]
- Use report_summary and scores
- Add score cards
- Add summary, findings, risk, recommendation, limitation blocks
- Add forecast summary cards
- Add scenario highlights
```

---

### Phase 6 - Report, Sources, Gaps

```text
- Build full report page
- Build source page
- Build data gap UI
- Add copy/open link actions
```

---

### Phase 7 - History

```text
- Build /analysis/history
- Fetch GET /api/analysis/runs
- Render caller-owned history list
- Open detail using analysis_public_id
```

---

### Phase 8 - Admin Optional

```text
- Build /admin/prompts
- Build /admin/providers
- Add admin guard
```

---

### Phase 9 - Optimization

```text
- Dynamic import markdown/admin components
- Run bundle analyzer
- Review client/server boundaries
- Ensure no secrets in client bundle
- Remove unused dependencies
```

---

## 24. Definition of Done

Frontend V1 is complete when:

```text
- Built with Next.js + TypeScript.
- Uses Tailwind CSS and shadcn/ui.
- Uses TanStack Query.
- Uses Next route handlers as BFF.
- Stores JWT in httpOnly cookies.
- Login works.
- /analysis/new works.
- /analysis/history fetches caller-owned rows from GET /api/v1/analysis-runs.
- /analysis/[analysisPublicId] displays structured overview.
- /analysis/[analysisPublicId] displays forecast section from report_summary.
- /analysis/[analysisPublicId]/report displays markdown.
- /analysis/[analysisPublicId]/sources displays source table.
- Uses analysis_public_id for all analysis routes.
- Does not use internal analysis id for resource URLs.
- Handles ANALYSIS_NOT_FOUND as not found.
- Uses report_summary for UI cards.
- Uses scores for score cards.
- Uses sources for source table.
- Uses data_gaps for gap list.
- Uses report_markdown only for full report display.
- Does not depend on internal numeric IDs for sources/data gaps.
- Does not expose secrets in client bundle.
- Avoids heavy dependencies.
```

---

## 25. AI Frontend Agent Rules

If an AI agent implements this frontend:

```text
1. Use Next.js App Router.
2. Use TypeScript everywhere.
3. Use shadcn/ui + Tailwind CSS.
4. Use TanStack Query for server state.
5. Do not use Redux in V1.
6. Do not call FastAPI directly from browser components.
7. Use Next route handlers as BFF.
8. Store tokens in httpOnly cookies.
9. Do not store tokens in localStorage.
10. Use analysis_public_id for all analysis routes and query keys.
11. Do not use internal analysis id in the frontend route model.
12. Use GET /api/v1/analysis-runs for history.
13. Do not assume admin can read another user's analysis.
14. Treat 404 ANALYSIS_NOT_FOUND as not found.
15. Use report_summary for UI cards.
16. Use scores for KPI cards.
17. Use sources for source table.
18. Use data_gaps for gap list.
19. Use report_markdown only for report reader.
20. Do not parse markdown to build UI state.
21. Display forecast fields from report_summary.
22. If forecast_confidence is low/unknown/partial/insufficient, label forecast as qualitative.
23. Do not depend on source/data gap internal IDs.
24. Add request_id to visible error details.
25. Keep components small.
26. Use dynamic import for markdown/admin-heavy components.
27. Avoid heavy dependencies.
28. Ensure production build has no exposed secrets.
```

---

## 26. Final Frontend Architecture Summary

```text
User
→ Next.js login
→ JWT stored in httpOnly cookies
→ Analysis form submits structured payload
→ Next route handler attaches Bearer token
→ FastAPI runs analysis
→ Backend returns analysis_public_id, scores, report_summary, sources, data_gaps, markdown
→ TanStack Query caches result by analysis_public_id
→ /analysis/[analysisPublicId] renders overview + forecast summary
→ /analysis/[analysisPublicId]/report renders markdown
→ /analysis/[analysisPublicId]/sources renders evidence sources
→ /analysis/history loads caller-owned rows from GET /api/v1/analysis-runs
```

This architecture is aligned with the latest backend contract and optimized for a lightweight, secure, cache-aware Next.js V1 frontend.
