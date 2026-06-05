"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBadge } from "@/components/charts/chart-badge";
import { ChartFallback } from "@/components/charts/chart-fallback";

interface ChartWrapperProps {
  title: string;
  badgeType?: "ai-derived" | "source-backed";
  isFallback: boolean;
  fallbackReason: string | null;
  children: ReactNode;
}

export function ChartWrapper({
  title,
  badgeType,
  isFallback,
  fallbackReason,
  children,
}: ChartWrapperProps) {
  if (isFallback) {
    return (
      <Card className="pt-0 transition-all duration-300 hover:shadow-md hover:border-primary/20 overflow-hidden">
        <CardHeader className="pt-4 pb-4 bg-gradient-to-r from-muted/50 to-transparent border-b">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartFallback reason={fallbackReason ?? "Data tidak tersedia."} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0 transition-all duration-300 hover:shadow-md hover:border-primary/20 overflow-hidden group">
      <CardHeader className="pt-4 pb-4 bg-gradient-to-r from-muted/50 to-transparent border-b transition-colors group-hover:from-muted/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {badgeType && <ChartBadge type={badgeType} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
