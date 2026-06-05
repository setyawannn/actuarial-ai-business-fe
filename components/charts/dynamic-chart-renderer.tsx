import { ChartDataItem, ChartType } from "@/types/api";
import { RiskDomainChart } from "@/components/charts/risk-domain-chart";
import { DataAvailabilityChart } from "@/components/charts/data-availability-chart";
import { SourceCoverageChart } from "@/components/charts/source-coverage-chart";
import { ForecastScenarioCards } from "@/components/charts/forecast-scenario-cards";
import { EventTimelineChart } from "@/components/charts/event-timeline-chart";
import { RiskDomainMapChart } from "@/components/charts/risk-domain-map-chart";

const CHART_REGISTRY: Record<ChartType, React.ComponentType<any>> = {
  risk_domain: RiskDomainChart,
  data_availability: DataAvailabilityChart,
  source_coverage: SourceCoverageChart,
  forecast_scenario: ForecastScenarioCards,
  event_timeline: EventTimelineChart,
  risk_domain_map: RiskDomainMapChart,
};

interface DynamicChartRendererProps { item: ChartDataItem; }

export function DynamicChartRenderer({ item }: DynamicChartRendererProps) {
  const { chart_type, is_fallback, fallback_reason, chart_data } = item;
  
  const ChartComponent = CHART_REGISTRY[chart_type];
  
  if (!ChartComponent) {
    return null;
  }

  return (
    <ChartComponent
      chartData={chart_data}
      isFallback={is_fallback}
      fallbackReason={fallback_reason}
    />
  );
}
