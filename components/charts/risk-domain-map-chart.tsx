"use client";

import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { Badge } from "@/components/ui/badge";
import { ShieldAlertIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";

interface RiskDomainMapItem {
  name: string;
  level: "low" | "medium" | "high" | string;
  detail: string;
}

interface RiskDomainMapData {
  status: string;
  description: string;
  domains: RiskDomainMapItem[];
  meta: { description: string };
}

interface RiskDomainMapChartProps {
  chartData: RiskDomainMapData;
  isFallback: boolean;
  fallbackReason: string | null;
}

export function RiskDomainMapChart({
  chartData,
  isFallback,
  fallbackReason,
}: RiskDomainMapChartProps) {
  const getLevelStyles = (level: string) => {
    const l = level.toLowerCase();
    if (l === "high") {
      return {
        bg: "bg-destructive/10 border-destructive/20",
        icon: <ShieldAlertIcon className="size-5 text-destructive" />,
        badge: "destructive",
      };
    }
    if (l === "medium") {
      return {
        bg: "bg-amber-500/10 border-amber-500/20",
        icon: <ShieldIcon className="size-5 text-amber-500" />,
        badge: "secondary",
      };
    }
    return {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: <ShieldCheckIcon className="size-5 text-emerald-500" />,
      badge: "outline",
    };
  };

  return (
    <ChartWrapper
      title="Risk Taxonomy Map"
      badgeType="ai-derived"
      isFallback={isFallback}
      fallbackReason={fallbackReason}
    >
      {chartData?.description && (
        <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {chartData.description}
          </p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {chartData?.domains?.map((domain, index) => {
          const styles = getLevelStyles(domain.level);
          return (
            <div
              key={index}
              className={`rounded-xl border p-4 ${styles.bg} transition-colors`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {styles.icon}
                  <h4 className="text-sm font-semibold text-foreground">
                    {domain.name}
                  </h4>
                </div>
                <Badge
                  variant={styles.badge as any}
                  className="capitalize shadow-none"
                >
                  {domain.level}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {domain.detail}
              </p>
            </div>
          );
        })}
      </div>
    </ChartWrapper>
  );
}
