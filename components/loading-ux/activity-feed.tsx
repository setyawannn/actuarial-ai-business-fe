"use client";

import { ClockIcon, SearchIcon, BrainCircuitIcon, FileTextIcon, CheckCircleIcon } from "lucide-react";

interface Activity { id: string; message: string; timestamp: string; icon: "search" | "brain" | "file" | "check" | "clock"; status: "pending" | "active" | "done"; }
interface ActivityFeedProps { activities: Activity[]; }

const iconMap = { search: SearchIcon, brain: BrainCircuitIcon, file: FileTextIcon, check: CheckCircleIcon, clock: ClockIcon };

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const Icon = iconMap[activity.icon];
        return (
          <div key={activity.id} className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
            activity.status === "active" ? "border-blue-500/30 bg-blue-500/5"
            : activity.status === "done" ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-border/50 bg-muted/20"
          }`}>
            <Icon className={`mt-0.5 size-4 shrink-0 ${
              activity.status === "active" ? "animate-pulse text-blue-500"
              : activity.status === "done" ? "text-emerald-500"
              : "text-muted-foreground/50"
            }`} />
            <div className="flex-1">
              <p className={`${
                activity.status === "active" ? "text-foreground"
                : activity.status === "done" ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground/50"
              }`}>{activity.message}</p>
              <p className="text-xs text-muted-foreground/60">{activity.timestamp}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
