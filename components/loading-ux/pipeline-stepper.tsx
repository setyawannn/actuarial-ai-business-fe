"use client";

import { CheckIcon, Loader2Icon } from "lucide-react";

interface Step { id: string; label: string; status: "pending" | "active" | "completed"; }
interface PipelineStepperProps { steps: Step[]; }

export function PipelineStepper({ steps }: PipelineStepperProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-medium ${
              step.status === "completed"
                ? "border-emerald-500 bg-emerald-500 text-white"
                : step.status === "active"
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "border-muted-foreground/30 text-muted-foreground/50"
            }`}>
              {step.status === "completed" ? <CheckIcon className="size-4" /> : step.status === "active" ? <Loader2Icon className="size-3.5 animate-spin" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-6 w-0.5 ${step.status === "completed" ? "bg-emerald-500/40" : "bg-muted-foreground/20"}`} />}
          </div>
          <div className="pt-0.5">
            <p className={`text-sm ${
              step.status === "completed" ? "text-emerald-600 dark:text-emerald-400"
              : step.status === "active" ? "font-medium text-foreground"
              : "text-muted-foreground/50"
            }`}>{step.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
