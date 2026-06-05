"use client";

import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, AlertCircleIcon, InfoIcon } from "lucide-react";

interface TimelineEvent {
  year: string;
  event: string;
  impact: string;
  type: "positive" | "negative" | "neutral";
}

interface EventTimelineData {
  events: TimelineEvent[];
  meta: { description: string };
}

interface EventTimelineChartProps {
  chartData: EventTimelineData;
  isFallback: boolean;
  fallbackReason: string | null;
}

export function EventTimelineChart({
  chartData,
  isFallback,
  fallbackReason,
}: EventTimelineChartProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle2Icon className="size-5 text-emerald-500" />;
      case "negative":
        return <AlertCircleIcon className="size-5 text-destructive" />;
      default:
        return <InfoIcon className="size-5 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "positive":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "negative":
        return "border-destructive/30 bg-destructive/5";
      default:
        return "border-border/50 bg-muted/30";
    }
  };

  return (
    <ChartWrapper
      title="3-Year Event Timeline"
      badgeType="ai-derived"
      isFallback={isFallback}
      fallbackReason={fallbackReason}
    >
      <div className="relative space-y-4 pl-4 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-border">
        {chartData?.events?.map((eventItem, index) => (
          <div key={index} className="relative pl-8">
            <div className="absolute left-2 top-1.5 -translate-x-1/2 rounded-full bg-background p-1 z-10 flex items-center justify-center">
              {getEventIcon(eventItem.type)}
            </div>
            <div
              className={`rounded-xl border p-4 ${getEventColor(eventItem.type)}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="font-semibold">
                  {eventItem.year}
                </Badge>
                <Badge
                  variant="secondary"
                  className="capitalize text-muted-foreground"
                >
                  {eventItem.type}
                </Badge>
              </div>
              <h4 className="mb-1 text-sm font-semibold text-foreground">
                {eventItem.event}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {eventItem.impact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
}
