import { AnalysisRunResult } from "@/types/api";

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
    confidence: number;
    dataAvailability: number;
  };
  dataGapsCount: number;
}

export function toAnalysisOverviewViewModel(
  detail: AnalysisRunResult
): AnalysisOverviewViewModel {
  return {
    publicId: detail.analysis_public_id,
    status: detail.status,
    companyName: detail.report_summary?.company_name || "Unknown",
    goal: detail.report_summary?.analysis_goal || "Unknown",
    executiveSummary:
      detail.report_summary?.overall_conclusion ??
      "No conclusion available.",
    keyFindings: detail.report_summary?.top_findings ?? [],
    historicalSummary:
      detail.report_summary?.historical_3y_summary ??
      "No historical data available.",
    forecastSummary:
      detail.report_summary?.forecast_3y_summary ?? "No forecast available.",
    forecastConfidence: detail.report_summary?.forecast_confidence ?? "N/A",
    forecastMethods: detail.report_summary?.forecast_methods_used ?? [],
    scenarioHighlights: detail.report_summary?.scenario_highlights ?? [],
    scores: {
      risk: detail.scores?.overall_risk_score ?? 0,
      confidence: detail.scores?.confidence_score ?? 0,
      dataAvailability: detail.scores?.data_availability_score ?? 0,
    },
    dataGapsCount: detail.data_gaps?.length ?? 0,
  };
}
