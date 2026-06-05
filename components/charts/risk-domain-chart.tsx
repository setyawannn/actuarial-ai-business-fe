"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import { ChartWrapper } from "@/components/charts/chart-wrapper";

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
  const radarData = chartData?.labels?.map((label, i) => ({
    domain: label,
    score: chartData.datasets[0].data[i],
  })) ?? [];

  return (
    <ChartWrapper
      title="Risk Domain Breakdown"
      badgeType="ai-derived"
      isFallback={isFallback}
      fallbackReason={fallbackReason}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold" style={{ color: chartData?.summary?.risk_level_color }}>
          {chartData?.summary?.overall_risk}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Overall Risk</p>
          <p className="font-medium capitalize text-foreground">{chartData?.summary?.risk_category}</p>
        </div>
      </div>
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground opacity-50" />
            <Radar 
              name="Risk Score" 
              dataKey="score" 
              stroke={chartData?.datasets?.[0]?.borderColor?.[0] || "#8884d8"} 
              fill={chartData?.datasets?.[0]?.backgroundColor?.[0] || "#8884d8"} 
              fillOpacity={0.4} 
              isAnimationActive={true}
            />
            <RechartsTooltip 
              contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.8)", color: "#fff", backdropFilter: "blur(4px)" }}
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
              formatter={(value: any) => [`${value} / 100`, "Risk Score"]}
            />
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
    </ChartWrapper>
  );
}
