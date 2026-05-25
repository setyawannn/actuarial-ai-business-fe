"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBadge } from "@/components/charts/chart-badge";
import { ChartFallback } from "@/components/charts/chart-fallback";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BreakdownItem { label: string; found: boolean; points_earned: number; points_max: number; }
interface DataAvailabilityData {
  score: number; category: string; color: string; breakdown: BreakdownItem[];
  donut: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] };
  meta: { description: string };
}
interface DataAvailabilityChartProps {
  chartData: DataAvailabilityData; isFallback: boolean; fallbackReason: string | null;
}

export function DataAvailabilityChart({ chartData, isFallback, fallbackReason }: DataAvailabilityChartProps) {
  if (isFallback) {
    return (
      <Card>
        <CardHeader><CardTitle>Data Availability Score</CardTitle></CardHeader>
        <CardContent><ChartFallback reason={fallbackReason ?? "Data ketersediaan tidak tersedia."} /></CardContent>
      </Card>
    );
  }

  const donutData = chartData.donut.labels.map((label, i) => ({
    name: label, value: chartData.donut.datasets[0].data[i], color: chartData.donut.datasets[0].backgroundColor[i],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Data Availability Score</CardTitle>
          <ChartBadge type="source-backed" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold" style={{ color: chartData.color }}>{chartData.score}</div>
          <div>
            <p className="text-sm font-medium capitalize text-foreground">{chartData.category}</p>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.breakdown.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell>
                  {item.found ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckIcon className="size-4" /> Found
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500">
                      <XIcon className="size-4" /> Missing
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{item.points_earned}/{item.points_max}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
