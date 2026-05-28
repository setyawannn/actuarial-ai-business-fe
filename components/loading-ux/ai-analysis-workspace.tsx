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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentText = loadingTexts[textIndex];

  // Map progress to steps
  const steps = React.useMemo(() => {
    return [
      {
        id: "research",
        label: "Riset Data Publik",
        status: progress < 40 ? "active" : "completed",
      },
      {
        id: "analysis",
        label: "Analisis Risiko",
        status: progress >= 40 && progress < 70 ? "active" : progress >= 70 ? "completed" : "pending",
      },
      {
        id: "report",
        label: "Penyusunan Laporan",
        status: progress >= 70 && progress < 95 ? "active" : progress >= 95 ? "completed" : "pending",
      },
      {
        id: "complete",
        label: "Finalisasi Hasil",
        status: progress >= 95 ? "active" : "pending",
      },
    ] as const;
  }, [progress]);

  const activities = React.useMemo(() => {
    return [
      {
        id: "1",
        message: "Mencari data dari internet...",
        timestamp: progress < 20 ? "saat ini" : "selesai",
        icon: "search" as const,
        status: progress < 40 ? "active" : "done",
      },
      {
        id: "2",
        message: "Mengevaluasi konteks data...",
        timestamp: status === "evaluating_context" ? "saat ini" : progress >= 40 ? "selesai" : "-",
        icon: "clock" as const,
        status: status === "evaluating_context" ? "active" : progress >= 40 ? "done" : "pending",
      },
      {
        id: "3",
        message: "Menganalisis posisi pasar & kompetisi...",
        timestamp: progress >= 40 && progress < 70 ? "saat ini" : progress >= 70 ? "selesai" : "-",
        icon: "brain" as const,
        status: progress >= 40 && progress < 70 ? "active" : progress >= 70 ? "done" : "pending",
      },
      {
        id: "4",
        message: "Menyusun laporan komprehensif...",
        timestamp: progress >= 70 ? "saat ini" : "-",
        icon: "file" as const,
        status: progress >= 70 && progress < 95 ? "active" : progress >= 95 ? "done" : "pending",
      },
    ] as const;
  }, [progress, status]);

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
          <div className="rounded-xl border border-border/70 p-4 bg-card shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress Keseluruhan</p>
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
