import { ChartDataItem } from "@/types/api";
import { RiskDomainChart } from "@/components/charts/risk-domain-chart";
import { DataAvailabilityChart } from "@/components/charts/data-availability-chart";
import { SourceCoverageChart } from "@/components/charts/source-coverage-chart";
import { ForecastScenarioCards } from "@/components/charts/forecast-scenario-cards";

interface DynamicChartRendererProps { item: ChartDataItem; }

export function DynamicChartRenderer({ item }: DynamicChartRendererProps) {
  const { chart_type, is_fallback, fallback_reason, chart_data } = item;
  switch (chart_type) {
    case "risk_domain":
      return <RiskDomainChart chartData={chart_data as never} isFallback={is_fallback} fallbackReason={fallback_reason} />;
    case "data_availability":
      return <DataAvailabilityChart chartData={chart_data as never} isFallback={is_fallback} fallbackReason={fallback_reason} />;
    case "source_coverage":
      return <SourceCoverageChart chartData={chart_data as never} isFallback={is_fallback} fallbackReason={fallback_reason} />;
    case "forecast_scenario":
      return <ForecastScenarioCards chartData={chart_data as never} isFallback={is_fallback} fallbackReason={fallback_reason} />;
    default:
      return null;
  }
}
