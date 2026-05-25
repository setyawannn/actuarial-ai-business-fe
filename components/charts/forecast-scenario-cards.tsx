import { AlertTriangleIcon, ShieldAlertIcon, LightbulbIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartBadge } from "@/components/charts/chart-badge";
import { ChartFallback } from "@/components/charts/chart-fallback";

interface ScenarioCard { name: string; type: string; trigger: string; impact: string; severity: string; response: string; color: string; }
interface ForecastScenarioData {
  qualitative_view: string; confidence: string; numeric_forecast_allowed: boolean; horizon_years: number[];
  scenario_cards: ScenarioCard[]; historical_summary: string; historical_quality: string;
  data_sufficiency: { status: string; reason: string }; required_data_for_numeric: string[];
}
interface ForecastScenarioCardsProps {
  chartData: ForecastScenarioData; isFallback: boolean; fallbackReason: string | null;
}

function severityColor(severity?: string | null) {
  if (!severity) return "text-emerald-500";
  const s = severity.toLowerCase();
  if (s.includes("high") || s.includes("severe")) return "text-red-500";
  if (s.includes("medium") || s.includes("moderate")) return "text-amber-500";
  return "text-emerald-500";
}

export function ForecastScenarioCards({ chartData, isFallback, fallbackReason }: ForecastScenarioCardsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">3-Year Forecast & Scenarios</CardTitle>
          <div className="flex gap-1">
            <ChartBadge type="ai-derived" />
            {chartData.confidence && <Badge variant="outline">{chartData.confidence}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFallback && fallbackReason && <ChartFallback reason={fallbackReason} />}
        {chartData.qualitative_view && (
          <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
            <p className="text-sm leading-6 text-muted-foreground">{chartData.qualitative_view}</p>
          </div>
        )}
        {chartData.historical_summary && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Historical Summary</p>
            <p className="text-sm leading-6 text-muted-foreground">{chartData.historical_summary}</p>
          </div>
        )}
        {chartData.scenario_cards.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Scenario Cards</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {chartData.scenario_cards.map((scenario, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-border/70 bg-card">
                  <div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: scenario.color }} />
                  <div className="space-y-2 p-4 pl-5">
                    <div className="flex items-center gap-2">
                      <ShieldAlertIcon className="size-4" style={{ color: scenario.color }} />
                      <p className="text-sm font-semibold text-foreground">{scenario.name}</p>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p><span className="font-medium text-foreground">Trigger:</span> {scenario.trigger}</p>
                      <p><span className="font-medium text-foreground">Impact:</span> {scenario.impact}</p>
                      <p><span className="font-medium text-foreground">Response:</span> {scenario.response}</p>
                    </div>
                    <Badge variant="outline" className={severityColor(scenario.severity)}>{scenario.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {chartData.data_sufficiency && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{chartData.data_sufficiency.reason || "Data sufficiency: " + chartData.data_sufficiency.status}</span>
          </div>
        )}
        {chartData.required_data_for_numeric.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Required for Numeric Forecast</p>
            <ul className="space-y-1">
              {chartData.required_data_for_numeric.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
