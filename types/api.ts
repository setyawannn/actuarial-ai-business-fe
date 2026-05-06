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
  risk_score: number;
  market_potential: number;
  financial_health: number;
  operational_efficiency: number;
}

export interface AnalysisSource {
  id?: string | number; // DO NOT rely on this as a React key
  title: string;
  url?: string;
  type: string;
  relevance: string;
  extracted_at?: string;
}

export interface AnalysisDataGap {
  id?: string | number; // DO NOT rely on this as a React key
  category: string;
  description: string;
  impact_level: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export interface AnalysisReportSummary {
  executive_summary: string;
  key_findings: string[];
  historical_3y_summary?: string | null;
  forecast_3y_summary?: string | null;
  forecast_confidence?: string | null;
  forecast_methods_used: string[];
  scenario_highlights: string[];
}

export interface AnalysisRunResult {
  analysis_public_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  company_name: string;
  analysis_goal: AnalysisGoal;
}

export interface AnalysisRunDetail extends AnalysisRunResult {
  report_summary?: AnalysisReportSummary;
  scores?: AnalysisScores;
  data_gaps?: AnalysisDataGap[];
}

export interface AnalysisReportDetail extends AnalysisRunResult {
  report_markdown: string;
  report_summary?: AnalysisReportSummary;
  scores?: AnalysisScores;
  sources?: AnalysisSource[];
  data_gaps?: AnalysisDataGap[];
}
