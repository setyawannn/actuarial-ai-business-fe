"use client";

import * as React from "react";
import { PipelineStepper } from "@/components/loading-ux/pipeline-stepper";
import { ActivityFeed } from "@/components/loading-ux/activity-feed";
import { ReportSkeleton } from "@/components/loading-ux/report-skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface AiAnalysisWorkspaceProps {
  companyName?: string | null;
  status?: string;
  progress?: number;
}

const loadingTexts = [
  "Mencari informasi resmi di situs perusahaan...",
  "Mengumpulkan artikel berita dan rilis keuangan...",
  "Menganalisis domain risiko bisnis utama...",
  "Menguji konsistensi data keuangan historis...",
  "Menyusun laporan kesimpulan eksekutif...",
  "Memformulasikan skenario proyeksi 3 tahun...",
  "Menyiapkan visualisasi metrik dan grafik...",
  "Memvalidasi silang data dari sumber kredibel...",
];

export function AiAnalysisWorkspace({ companyName, status = "processing", progress = 0 }: AiAnalysisWorkspaceProps) {
  const [textIndex, setTextIndex] = React.useState(0);
  const [simulatedProgress, setSimulatedProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Set up smooth dynamic progress simulation
  React.useEffect(() => {
    // If completed or failed, jump to 100 or stop
    if (status === "completed" || progress >= 100) {
      setSimulatedProgress(100);
      return;
    }
    
    // If needs more context, pause simulation
    if (status === "needs_more_context") {
      return;
    }

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 98) {
          // Crawl extremely slowly near completion
          return Math.min(99, prev + 0.1);
        }
        
        // Dynamic increments based on current progress phase
        let increment = 1;
        if (prev < 20) {
          increment = Math.random() * 3 + 2; // Fast start (2% - 5%)
        } else if (prev < 50) {
          increment = Math.random() * 2 + 1; // Medium pace (1% - 3%)
        } else if (prev < 80) {
          increment = Math.random() * 1.5 + 0.5; // Slower (0.5% - 2%)
        } else {
          increment = Math.random() * 0.8 + 0.2; // Slow synthesis (0.2% - 1%)
        }
        
        return Math.min(98, prev + increment);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [status, progress]);

  // The effective progress is the max of our simulation and the actual backend progress
  const effectiveProgress = Math.max(simulatedProgress, progress);

  const currentText = loadingTexts[textIndex];

  // Map progress to steps
  const steps = React.useMemo(() => {
    return [
      {
        id: "research",
        label: "Riset Data Publik",
        status: effectiveProgress < 40 ? "active" : "completed",
      },
      {
        id: "analysis",
        label: "Analisis Risiko",
        status: effectiveProgress >= 40 && effectiveProgress < 70 ? "active" : effectiveProgress >= 70 ? "completed" : "pending",
      },
      {
        id: "report",
        label: "Penyusunan Laporan",
        status: effectiveProgress >= 70 && effectiveProgress < 95 ? "active" : effectiveProgress >= 95 ? "completed" : "pending",
      },
      {
        id: "complete",
        label: "Finalisasi Hasil",
        status: effectiveProgress >= 95 ? "active" : "pending",
      },
    ] as const;
  }, [effectiveProgress]);

  const activities = React.useMemo(() => {
    return [
      {
        id: "1",
        message: "Mencari data dari internet...",
        timestamp: effectiveProgress < 20 ? "saat ini" : "selesai",
        icon: "search" as const,
        status: effectiveProgress < 40 ? "active" : "done",
      },
      {
        id: "2",
        message: "Mengevaluasi konteks data...",
        timestamp: status === "evaluating_context" ? "saat ini" : effectiveProgress >= 40 ? "selesai" : "-",
        icon: "clock" as const,
        status: status === "evaluating_context" ? "active" : effectiveProgress >= 40 ? "done" : "pending",
      },
      {
        id: "3",
        message: "Menganalisis posisi pasar & kompetisi...",
        timestamp: effectiveProgress >= 40 && effectiveProgress < 70 ? "saat ini" : effectiveProgress >= 70 ? "selesai" : "-",
        icon: "brain" as const,
        status: effectiveProgress >= 40 && effectiveProgress < 70 ? "active" : effectiveProgress >= 70 ? "done" : "pending",
      },
      {
        id: "4",
        message: "Menyusun laporan komprehensif...",
        timestamp: effectiveProgress >= 70 ? "saat ini" : "-",
        icon: "file" as const,
        status: effectiveProgress >= 70 && effectiveProgress < 95 ? "active" : effectiveProgress >= 95 ? "done" : "pending",
      },
    ] as const;
  }, [effectiveProgress, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          {companyName ? `Menganalisis ${companyName}...` : "Mempersiapkan analisis AI..."}
        </h2>
        
        {/* Rotating Loading Text */}
        <div className="flex items-center gap-2 h-6 overflow-hidden">
          <div className="flex size-2 shrink-0 rounded-full bg-primary animate-pulse" />
          <AnimatePresence mode="wait">
            <motion.p
              key={status === "resuming_analysis" ? "resuming" : currentText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground font-medium"
            >
              {status === "resuming_analysis" ? "Melanjutkan analisis dengan konteks tambahan..." : currentText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 p-4 bg-card shadow-sm space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Progress Keseluruhan</span>
                <span className="font-mono text-primary text-sm font-bold">{Math.round(effectiveProgress)}%</span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(0, effectiveProgress))}%` }} 
                />
              </div>
            </div>
            <PipelineStepper steps={steps as any} />
          </div>
          <div className="rounded-xl border border-border/70 p-4 bg-card shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Aktivitas AI</p>
            <ActivityFeed activities={activities as any} />
          </div>
        </div>
        <div className="rounded-xl border border-border/70 p-6 bg-card shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 z-10 pointer-events-none" />
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pratinjau Laporan</p>
          <ReportSkeleton />
        </div>
      </div>
    </div>
  );
}
