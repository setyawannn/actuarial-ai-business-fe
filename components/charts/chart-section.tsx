"use client";

import { useAnalysisChartsQuery } from "@/hooks/use-analysis";
import { DynamicChartRenderer } from "@/components/charts/dynamic-chart-renderer";
import { LoadingSection } from "@/components/loading-section";
import { ErrorCard } from "@/components/error-card";

interface ChartSectionProps { publicId: string; }

export function ChartSection({ publicId }: ChartSectionProps) {
  const { data, isLoading, error } = useAnalysisChartsQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Charts & Visualizations</h3>
        <LoadingSection.Cards columns={2} />
        <LoadingSection.Content height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Charts & Visualizations</h3>
        <ErrorCard title="Gagal memuat chart" error={error} />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Charts & Visualizations</h3>
      <div className="grid gap-4 xl:grid-cols-2">
        {data.map((item) => <DynamicChartRenderer key={item.chart_type} item={item} />)}
      </div>
    </div>
  );
}
