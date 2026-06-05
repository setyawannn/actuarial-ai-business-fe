"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckIcon, XIcon } from "lucide-react";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
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
  const donutData = chartData?.donut?.labels?.map((label, i) => ({
    name: label, value: chartData.donut.datasets[0].data[i], color: chartData.donut.datasets[0].backgroundColor[i],
  })) ?? [];

  return (
    <ChartWrapper
      title="Data Availability Score"
      badgeType="source-backed"
      isFallback={isFallback}
      fallbackReason={fallbackReason}
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold" style={{ color: chartData.color }}>{chartData.score}</div>
        <div>
          <p className="text-sm font-medium capitalize text-foreground">{chartData.category}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </div>
      </div>
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={donutData} 
              cx="50%" cy="50%" 
              innerRadius={55} outerRadius={75} 
              dataKey="value" startAngle={90} endAngle={-270}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={true}
            >
              {donutData.map((entry, index) => <Cell key={index} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.8)", color: "#fff", backdropFilter: "blur(4px)" }}
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-md border overflow-hidden mt-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.breakdown.map((item, i) => (
              <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{item.label}</TableCell>
                <TableCell>
                  {item.found ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <CheckIcon className="size-3.5" /> Found
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
                      <XIcon className="size-3.5" /> Missing
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-sm text-muted-foreground">{item.points_earned}/{item.points_max}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartWrapper>
  );
}
