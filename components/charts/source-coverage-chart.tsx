"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { ChartBadge } from "@/components/charts/chart-badge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SourceCoverageData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string[] }[];
  summary: {
    total_sources: number; avg_credibility: number; credibility_level: string;
    breakdown_by_type: { type: string; label: string; count: number; avg_credibility: number; color: string }[];
  };
  meta: { description: string };
}
interface SourceCoverageChartProps {
  chartData: SourceCoverageData; isFallback: boolean; fallbackReason: string | null;
}

export function SourceCoverageChart({ chartData, isFallback, fallbackReason }: SourceCoverageChartProps) {
  const barData = chartData?.labels?.map((label, i) => ({
    name: label, count: chartData.datasets[0].data[i], fill: chartData.datasets[0].backgroundColor[i],
  })) ?? [];

  return (
    <ChartWrapper
      title="Source Coverage by Type"
      badgeType="source-backed"
      isFallback={isFallback}
      fallbackReason={fallbackReason}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="text-sm">Total Sources: {chartData.summary.total_sources}</Badge>
        <Badge variant="outline" className="text-sm">Avg Credibility: {chartData.summary.avg_credibility}%</Badge>
        <Badge variant="outline" className="text-sm">Level: {chartData.summary.credibility_level}</Badge>
        <ChartBadge type="confidence" value={chartData.summary.avg_credibility} />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Source Count" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Avg Credibility</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.summary.breakdown_by_type.map((item, i) => (
            <TableRow key={i}>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              </TableCell>
              <TableCell className="text-right">{item.count}</TableCell>
              <TableCell className="text-right">{item.avg_credibility}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartWrapper>
  );
}
