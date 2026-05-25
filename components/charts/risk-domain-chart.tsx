"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBadge } from "@/components/charts/chart-badge";
import { ChartFallback } from "@/components/charts/chart-fallback";

interface RiskDomainData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string[]; borderColor: string[] }[];
  summary: { overall_risk: number; risk_category: string; risk_level_color: string; top_drivers: string[] };
  meta: { description: string; scale: { min: number; max: number } };
}

interface RiskDomainChartProps {
  chartData: RiskDomainData;
  isFallback: boolean;
  fallbackReason: string | null;
}

export function RiskDomainChart({ chartData, isFallback, fallbackReason }: RiskDomainChartProps) {
  if (isFallback) {
    return (
      <Card>
        <CardHeader><CardTitle>Risk Domain Breakdown</CardTitle></CardHeader>
        <CardContent><ChartFallback reason={fallbackReason ?? "Data risiko tidak tersedia."} /></CardContent>
      </Card>
    );
  }

  const radarData = chartData.labels.map((label, i) => ({
    domain: label,
    score: chartData.datasets[0].data[i],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Risk Domain Breakdown</CardTitle>
          <ChartBadge type="ai-derived" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold" style={{ color: chartData.summary.risk_level_color }}>
            {chartData.summary.overall_risk}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Overall Risk</p>
            <p className="font-medium capitalize text-foreground">{chartData.summary.risk_category}</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Risk Score" dataKey="score" stroke={chartData.datasets[0].borderColor[0]} fill={chartData.datasets[0].backgroundColor[0]} fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {chartData.summary.top_drivers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Top Risk Drivers</p>
            <ul className="space-y-1">
              {chartData.summary.top_drivers.map((driver, i) => (
                <li key={i} className="rounded-lg bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">{driver}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
