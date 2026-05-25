"use client";

import * as React from "react";
import { PipelineStepper } from "@/components/loading-ux/pipeline-stepper";
import { ActivityFeed } from "@/components/loading-ux/activity-feed";
import { ReportSkeleton } from "@/components/loading-ux/report-skeleton";

const defaultSteps = [
  { id: "research", label: "Researching public sources...", status: "active" as const },
  { id: "analysis", label: "Analyzing risk domains...", status: "pending" as const },
  { id: "report", label: "Generating report...", status: "pending" as const },
  { id: "complete", label: "Finalizing results...", status: "pending" as const },
];

const defaultActivities = [
  { id: "1", message: "Searching official website...", timestamp: "just now", icon: "search" as const, status: "active" as const },
  { id: "2", message: "Fetching financial data...", timestamp: "-", icon: "clock" as const, status: "pending" as const },
  { id: "3", message: "Analyzing market position...", timestamp: "-", icon: "brain" as const, status: "pending" as const },
  { id: "4", message: "Compiling report...", timestamp: "-", icon: "file" as const, status: "pending" as const },
];

interface AiAnalysisWorkspaceProps { companyName?: string; }

export function AiAnalysisWorkspace({ companyName }: AiAnalysisWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">AI Analysis Workspace</h2>
        <p className="text-sm text-muted-foreground">
          {companyName ? "Menganalisis " + companyName + "..." : "Mempersiapkan analisis..."}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pipeline Progress</p>
            <PipelineStepper steps={defaultSteps} />
          </div>
          <div className="rounded-xl border border-border/70 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Activity Log</p>
            <ActivityFeed activities={defaultActivities} />
          </div>
        </div>
        <div className="rounded-xl border border-border/70 p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Report Preview</p>
          <ReportSkeleton />
        </div>
      </div>
    </div>
  );
}
