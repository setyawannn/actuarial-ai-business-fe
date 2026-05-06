import { AnalysisRunDetail } from "@/types/api";

export interface AnalysisOverviewViewModel {
  publicId: string;
  status: string;
  companyName: string;
  goal: string;
  executiveSummary: string;
  keyFindings: string[];
  historicalSummary: string;
  forecastSummary: string;
  forecastConfidence: string;
  forecastMethods: string[];
  scenarioHighlights: string[];
  scores: {
    risk: number;
    market: number;
    financial: number;
    operational: number;
  };
  dataGapsCount: number;
  createdAt: string;
}

export function toAnalysisOverviewViewModel(
  detail: AnalysisRunDetail
): AnalysisOverviewViewModel {
  return {
    publicId: detail.analysis_public_id,
    status: detail.status,
    companyName: detail.company_name,
    goal: detail.analysis_goal,
    executiveSummary:
      detail.report_summary?.executive_summary ??
      "No executive summary available.",
    keyFindings: detail.report_summary?.key_findings ?? [],
    historicalSummary:
      detail.report_summary?.historical_3y_summary ??
      "No historical data available.",
    forecastSummary:
      detail.report_summary?.forecast_3y_summary ?? "No forecast available.",
    forecastConfidence: detail.report_summary?.forecast_confidence ?? "N/A",
    forecastMethods: detail.report_summary?.forecast_methods_used ?? [],
    scenarioHighlights: detail.report_summary?.scenario_highlights ?? [],
    scores: {
      risk: detail.scores?.risk_score ?? 0,
      market: detail.scores?.market_potential ?? 0,
      financial: detail.scores?.financial_health ?? 0,
      operational: detail.scores?.operational_efficiency ?? 0,
    },
    dataGapsCount: detail.data_gaps?.length ?? 0,
    createdAt: detail.created_at,
  };
}
