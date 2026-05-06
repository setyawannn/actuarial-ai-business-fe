export interface MetaResponse {
  request_id?: string;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: MetaResponse;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: MetaResponse;
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

// Auth Types
export type UserRole = "super_admin" | "admin" | "user";

export interface LoginResponseData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface MeResponseData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Analysis Request Types
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

// Analysis Response Types
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

export interface AnalysisReportDetail extends AnalysisRunResult {}
