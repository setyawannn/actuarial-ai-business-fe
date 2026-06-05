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

export interface ContextQuestion {
  question_id: string;
  question_text: string;
  reason_why_needed: string;
}

export interface ContextAnswerItem {
  question_id: string;
  answer: string;
}

export interface SubmitContextAnswersRequest {
  answers: ContextAnswerItem[];
  is_skipped: boolean;
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
  context_questions?: ContextQuestion[];
}

export interface AnalysisReportDetail {
  analysis_public_id: string;
  status: string;
  report_markdown: string;
  report_summary: AnalysisReportSummary | null;
}

export interface AnalysisSourcesDetail {
  analysis_public_id: string;
  status: string;
  report_summary?: AnalysisReportSummary | null;
  sources: AnalysisSource[];
  data_gaps: AnalysisDataGap[];
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
  change_note?: string | null;
  created_from_version_id?: string | null;
  is_draft?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  task_type: string;
  description: string | null;
  active_version_id: string | null;
  active_version?: PromptTemplateVersion | null;
  working_draft?: PromptTemplateVersion | null;
  editor_state?: {
    mode?: string | null;
    source?: string | null;
    message?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  versions: PromptTemplateVersion[];
}

export interface PromptVariableDefinition {
  key: string;
  token: string;
  label: string;
  description: string | null;
  required?: boolean;
  source?: string | null;
}

export interface PromptValidationResult {
  tokens_used: string[];
  unknown_tokens: string[];
  missing_required_variables: string[];
  warnings: string[];
}

export interface PromptRenderPreview {
  rendered_prompt?: string;
  preview?: string;
  content?: string;
  tokens_used?: string[];
  unknown_tokens?: string[];
  warnings?: string[];
}
// ─── Week 3: Chart Types ───────────────────────────────────────────────

export type ChartType = "risk_domain" | "data_availability" | "source_coverage" | "forecast_scenario" | "event_timeline" | "risk_domain_map";

export interface ChartDataItem {
  chart_type: ChartType;
  title: string;
  is_fallback: boolean;
  fallback_reason: string | null;
  chart_data: Record<string, unknown>;
}

export type AnalysisChartsResponse = ChartDataItem[];

// ─── Week 3: Usage / Billing Types ────────────────────────────────────

export interface LLMCallRecord {
  id: number;
  task_type: string;
  provider: string;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface TavilyUsage {
  query_count: number;
  cost_per_query_usd: number;
  total_cost_usd: number;
}

export interface UsageSummary {
  total_cost_usd: number;
  currency: string;
  duration_seconds: number;
  created_at: string;
  completed_at: string;
}

export interface AnalysisUsageResponse {
  analysis_public_id: string;
  company_name: string;
  analysis_goal: string;
  status: string;
  llm_usage: {
    total_calls: number;
    total_tokens: number;
    total_cost_usd: number;
    calls: LLMCallRecord[];
  };
  tavily_usage: TavilyUsage;
  summary: UsageSummary;
}

// ─── Week 3: Admin Analytics Types ─────────────────────────────────────

export interface DailyTrend {
  date: string;
  tokens: number;
  cost_usd: number;
  calls: number;
  tavily_queries: number;
}

export interface ModelBreakdown {
  model_name: string;
  total_tokens: number;
  total_calls: number;
  total_cost_usd: number;
}

export interface TaskBreakdown {
  task_type: string;
  total_tokens: number;
  total_calls: number;
  total_cost_usd: number;
}

export interface TopRecord {
  analysis_run_id: number;
  analysis_public_id: string;
  company_name: string;
  total_tokens: number;
  total_cost_usd: number;
  created_at: string;
}

export interface RunTableRow {
  analysis_public_id: string;
  company_name: string;
  owner_email: string;
  status: string;
  total_tokens: number;
  tavily_queries: number;
  total_cost_usd: number;
  models_used: string[];
  created_at: string;
}

export interface AdminUsageFilter {
  start_date: string;
  end_date: string;
  user_id: number | null;
}

export interface AdminUsageSummary {
  total_runs: number;
  total_llm_calls: number;
  total_tavily_queries: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_usd: number;
  total_llm_cost_usd: number;
  total_tavily_cost_usd: number;
  currency: string;
}

export interface AdminUsageCharts {
  daily_trend: DailyTrend[];
  model_breakdown: ModelBreakdown[];
  task_breakdown: TaskBreakdown[];
}

export interface AdminUsageTopRecords {
  highest_token_run: TopRecord | null;
  highest_cost_run: TopRecord | null;
}

export interface AdminUsageData {
  filter: AdminUsageFilter;
  summary: AdminUsageSummary;
  charts: AdminUsageCharts;
  top_records: AdminUsageTopRecords;
  // runs_table removed in week4 — use AdminRunsTableData from /admin/analytics/runs-table
}

// New in week4: dedicated paginated runs-table endpoint
export interface AdminRunsTableRow {
  analysis_public_id: string;
  company_name: string;
  owner_email: string;
  status: string;
  overall_risk_score: number | null;
  confidence_score: number | null;
  data_availability_score: number | null;
  total_tokens: number;
  tavily_queries: number;
  total_cost_usd: number;
  created_at: string;
  completed_at: string | null;
}

export interface AdminRunsTableMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AdminRunsTableData {
  data: AdminRunsTableRow[];
  meta: AdminRunsTableMeta;
  filter: {
    search: string | null;
    status: string | null;
    start_date: string | null;
    end_date: string | null;
    user_id: number | null;
  };
}

// Pagination meta for analysis history (week4)
export interface AnalysisHistoryMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AdminUsageResponse {
  status: string;
  code: string;
  message: string;
  data: AdminUsageData;
}

export interface AdminRunAuditRunMetadata {
  analysis_run_id: number;
  analysis_public_id: string;
  company_name: string;
  owner_email: string;
  status: string;
  progress: number;
  analysis_goal: string;
  language: string;
  created_at: string;
  completed_at: string | null;
}

export interface AdminRunAuditSummary {
  total_llm_calls: number;
  total_tavily_queries: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_latency_ms: number;
  total_cost_usd: number;
  total_llm_cost_usd: number;
  total_tavily_cost_usd: number;
  currency: string;
}

export interface AdminRunAuditLLMCall {
  id: number;
  task_type: string;
  provider: string;
  model_name: string;
  prompt_template_version_id: number | null;
  input_hash: string;
  input_variables_keys: string[];
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  error_message: string | null;
  created_at: string;
}

// Backend may return either a plain string or a rich object per query
export type AdminRunAuditTavilyQuery =
  | string
  | { query: string; purpose?: string; priority?: string };

export interface AdminRunAuditData {
  run_metadata: AdminRunAuditRunMetadata;
  summary: AdminRunAuditSummary;
  llm_calls_trace: AdminRunAuditLLMCall[];
  tavily_queries: AdminRunAuditTavilyQuery[];
}

export interface AdminRunAuditResponse {
  code: string;
  message: string;
  data: AdminRunAuditData;
}

// ─── Week 5: User Management Types ─────────────────────────────────────

export interface AdminUserListItem {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersTableData {
  items: AdminUserListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
