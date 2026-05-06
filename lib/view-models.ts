import { AnalysisReportDetail, AnalysisRunDetail, AnalysisRunResult } from "@/types/api";

export interface AnalysisOverviewViewModel {
  publicId: string;
  status: string;
  companyName: string;
  goal: string;
  executiveSummary: string | null;
  keyFindings: string[];
  historicalSummary: string | null;
  forecastSummary: string | null;
  forecastConfidence: string | null;
  forecastMethods: string[];
  scenarioHighlights: string[];
  scores: {
    overallRiskScore: number | null;
    confidenceScore: number | null;
    dataAvailabilityScore: number | null;
  };
  createdAt: string | null;
}

function hasText(value?: string | null) {
  return Boolean(value && value.trim() && !["n/a", "na", "unknown"].includes(value.trim().toLowerCase()));
}

export function toAnalysisOverviewViewModel(
  input: Partial<AnalysisRunResult> & Partial<AnalysisReportDetail> & Partial<AnalysisRunDetail>
): AnalysisOverviewViewModel {
  const reportSummary = input.report_summary ?? null;

  return {
    publicId: input.analysis_public_id ?? "",
    status: input.status ?? "unknown",
    companyName: reportSummary?.company_name ?? "Unknown Company",
    goal: reportSummary?.analysis_goal ?? input.analysis_goal ?? "unknown",
    executiveSummary: hasText(reportSummary?.overall_conclusion)
      ? reportSummary?.overall_conclusion ?? null
      : null,
    keyFindings: (reportSummary?.top_findings ?? []).filter(Boolean),
    historicalSummary: hasText(reportSummary?.historical_3y_summary)
      ? reportSummary?.historical_3y_summary ?? null
      : null,
    forecastSummary: hasText(reportSummary?.forecast_3y_summary)
      ? reportSummary?.forecast_3y_summary ?? null
      : null,
    forecastConfidence: hasText(reportSummary?.forecast_confidence)
      ? reportSummary?.forecast_confidence ?? null
      : null,
    forecastMethods: (reportSummary?.forecast_methods_used ?? []).filter(Boolean),
    scenarioHighlights: (reportSummary?.scenario_highlights ?? []).filter(Boolean),
    scores: {
      overallRiskScore:
        (input as AnalysisRunResult).scores?.overall_risk_score ?? input.overall_risk_score ?? null,
      confidenceScore:
        (input as AnalysisRunResult).scores?.confidence_score ?? input.confidence_score ?? null,
      dataAvailabilityScore:
        (input as AnalysisRunResult).scores?.data_availability_score ??
        input.data_availability_score ??
        null,
    },
    createdAt: input.created_at ?? null,
  };
}
