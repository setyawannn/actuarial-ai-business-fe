# TypeScript Models

## Analysis Contract Baseline

Frontend only uses `analysis_public_id` (`anl_<random>`) for analysis resources. Analysis is private to creator. Admin cannot read another user's analysis. `GET /api/v1/analysis-runs` is source of truth for history screen and returns caller-owned rows only. Non-owner detail/report/sources reads return `404 ANALYSIS_NOT_FOUND`.


Dokumen ini berisi model TypeScript yang bisa langsung diadopsi di frontend.

## 1. Common Envelope
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
```

## 2. Auth Types
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

## 3. Analysis Request Types
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

## 4. Analysis Response Types
```ts
export type AnalysisScores = {
  overall_risk_score: number | null;
  confidence_score: number | null;
  data_availability_score: number | null;
};

export type AnalysisSource = {
  id: string;
  title: string | null;
  url: string;
  domain: string | null;
  source_type: string | null;
  credibility_score: number | null;
  relevance_score: number | null;
  raw_snippet: string | null;
};

export type AnalysisDataGap = {
  id: string;
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

## 5. Admin Types
```ts
export type ProviderConfig = {
  id: string;
  provider_name: string;
  provider_type: string;
  is_enabled: boolean;
  priority: number;
  default_model: string | null;
  config: Record<string, unknown> | null;
  environment: string;
  created_at: string;
  updated_at: string;
};

export type ProviderCredential = {
  id: string;
  provider_name: string;
  credential_name: string;
  value_last_four: string | null;
  status: string;
  environment: string;
  metadata_: Record<string, unknown> | null;
  created_at: string;
  rotated_at: string | null;
};

export type PromptTemplateVersion = {
  id: string;
  template_id: string;
  version_tag: string;
  content: string;
  input_schema: Record<string, unknown> | null;
  output_schema: Record<string, unknown> | null;
  model_preferences: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type PromptTemplate = {
  id: string;
  name: string;
  task_type: string;
  description: string | null;
  active_version_id: string | null;
  created_at: string;
  updated_at: string;
  versions: PromptTemplateVersion[];
};
```
