export interface MetaResponse {
  request_id?: string;
  analysis_public_id?: string;
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface ApiEnvelopeErrorItem {
  field?: string | null;
  message: string;
  type?: string;
}

export interface ApiSuccess<T> {
  success: true;
  code: string;
  message: string;
  data: T;
  meta: MetaResponse;
  errors: null;
}

export interface ApiError {
  success: false;
  code?: string;
  message?: string;
  data: null;
  meta: MetaResponse;
  errors?: ApiEnvelopeErrorItem[];
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  code: string;
  meta?: MetaResponse;
  details?: unknown;

  constructor(message: string, code: string, meta?: MetaResponse, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.meta = meta;
    this.details = details;
  }
}

export type UserRole = "super_admin" | "admin" | "user";

export interface LoginResponseData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: "bearer";
  user?: {
    id: string;
    email: string;
    full_name?: string | null;
    role: UserRole;
  };
}

export interface MeResponseData {
  id: string;
  email: string;
  name?: string;
  full_name?: string | null;
  role: UserRole;
  is_active?: boolean;
}

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

export interface ExternalAnalysisRequest {
  company_name: string;
  legal_entity?: string | null;
  country: string;
  location?: string | null;
  industry: string;
  ticker?: string | null;
  website?: string | null;
  company_type?: CompanyType;
  analysis_goal: AnalysisGoal;
  language?: ReportLanguage;
  target_context?: Record<string, unknown>;
}

export interface AnalysisScores {
  overall_risk_score: number | null;
  confidence_score: number | null;
  data_availability_score: number | null;
}

export interface AnalysisSource {
  id?: string;
  title: string | null;
  url: string;
  domain: string | null;
  source_type: string | null;
  credibility_score: number | null;
  relevance_score: number | null;
  raw_snippet: string | null;
}

export interface AnalysisDataGap {
  id?: string;
  missing_item: string;
  importance: string | null;
  reason: string | null;
  recommended_action: string | null;
}

export interface AnalysisReportSummary {
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
}

export interface AnalysisRunResult {
  analysis_public_id: string;
  status: string;
  scores: AnalysisScores;
  report_markdown: string;
  report_summary: AnalysisReportSummary;
  sources: AnalysisSource[];
  data_gaps: AnalysisDataGap[];
}

export interface AnalysisRunListItem {
  id?: string;
  analysis_public_id: string;
  company_name?: string | null;
  analysis_goal: string;
  language: string;
  status: string;
  created_at?: string;
  completed_at?: string | null;
  overall_risk_score?: number | null;
  confidence_score?: number | null;
  data_availability_score?: number | null;
}

export interface AnalysisRunDetail {
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
}

export interface AnalysisReportDetail {
  analysis_public_id: string;
  status: string;
  report_markdown: string;
  report_summary: AnalysisReportSummary | null;
}

export interface ProviderConfig {
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
}

export interface ProviderCredential {
  id: string;
  provider_name: string;
  credential_name: string;
  value_last_four: string | null;
  status: string;
  environment: string;
  metadata_: Record<string, unknown> | null;
  created_at: string;
  rotated_at: string | null;
}

export interface PromptTemplateVersion {
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
}

export interface PromptTemplate {
  id: string;
  name: string;
  task_type: string;
  description: string | null;
  active_version_id: string | null;
  created_at: string;
  updated_at: string;
  versions: PromptTemplateVersion[];
}
