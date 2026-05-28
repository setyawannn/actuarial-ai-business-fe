"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAnalysisMutation } from "@/hooks/use-analysis";
import { useFeedback } from "@/lib/use-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyValueEditor } from "@/components/ui/key-value-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { LoadingSection } from "@/components/loading-section";
import { AiAnalysisWorkspace } from "@/components/loading-ux/ai-analysis-workspace";
import { AnalysisGoal, CompanyType, ReportLanguage, ExternalAnalysisRequest, ApiClientError } from "@/types/api";
import { BuildingIcon, TargetIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const analysisGoals: { value: AnalysisGoal; label: string; desc: string }[] = [
  { value: "business_health", label: "Kesehatan Bisnis", desc: "Evaluasi kondisi operasional dan finansial" },
  { value: "acquisition_risk", label: "Risiko Akuisisi", desc: "Penilaian due diligence untuk M&A" },
  { value: "investment_risk", label: "Risiko Investasi", desc: "Analisis potensi dan risiko pendanaan" },
  { value: "competitor_analysis", label: "Analisis Kompetitor", desc: "Pemetaan kekuatan vs pesaing" },
  { value: "vendor_risk", label: "Risiko Vendor", desc: "Evaluasi keandalan rantai pasok" },
  { value: "market_entry", label: "Masuk Pasar Baru", desc: "Studi kelayakan ekspansi" },
  { value: "partnership_risk", label: "Risiko Kemitraan", desc: "Analisis kelayakan partner strategis" },
];

const companyTypes: { value: CompanyType; label: string }[] = [
  { value: "private", label: "Perusahaan Tertutup (Private)" },
  { value: "public", label: "Perusahaan Terbuka (Public)" },
  { value: "unknown", label: "Tidak Diketahui" },
];

const formSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  legal_entity: z.string().optional(),
  country: z.string().min(1, "Negara wajib diisi"),
  location: z.string().optional(),
  industry: z.string().min(1, "Industri wajib diisi"),
  ticker: z.string().optional(),
  website: z.string().url("Format URL tidak valid (harus diawali http/https)").optional().or(z.literal("")),
  company_type: z.enum(["private", "public", "unknown"]).optional(),
  analysis_goal: z.enum([
    "business_health",
    "acquisition_risk",
    "investment_risk",
    "competitor_analysis",
    "vendor_risk",
    "market_entry",
    "partnership_risk",
  ]),
  language: z.enum(["id", "en"]).optional(),
  target_context_kv: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AnalysisRequestForm() {
  const router = useRouter();
  const mutation = useCreateAnalysisMutation();
  const feedback = useFeedback();
  const [globalError, setGlobalError] = React.useState<{ message: string; reqId?: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "id",
      company_type: "unknown",
    },
  });

  const selectedGoal = watch("analysis_goal");

  const onSubmit = (data: FormData) => {
    setGlobalError(null);
    
    const parsedTargetContext: Record<string, unknown> = {};
    if (data.target_context_kv) {
      data.target_context_kv.forEach(item => {
        const k = item.key.trim();
        if (!k) return;
        let parsedVal: unknown = item.value;
        try {
          parsedVal = JSON.parse(item.value);
        } catch {
          // Keep string if not valid JSON
        }
        parsedTargetContext[k] = parsedVal;
      });
    }

    const payload: ExternalAnalysisRequest = {
      company_name: data.company_name,
      country: data.country,
      industry: data.industry,
      analysis_goal: data.analysis_goal,
      language: data.language,
      website: data.website || undefined,
      legal_entity: data.legal_entity || undefined,
      location: data.location || undefined,
      ticker: data.ticker || undefined,
      company_type: data.company_type,
      target_context: Object.keys(parsedTargetContext).length > 0 ? parsedTargetContext : undefined,
    };

    mutation.mutate(payload, {
      onSuccess: (result) => {
        setIsRedirecting(true);
        feedback.success("Memulai Analisis...", "Sistem AI sedang bekerja, mohon tunggu sebentar.");
        router.push(`/analysis/${result.analysis_public_id}?new=true`);
      },
      onError: (error: Error) => {
        setIsRedirecting(false);
        const isDev = process.env.NODE_ENV === "development";
        
        if (error instanceof ApiClientError) {
          setGlobalError({
            message: error.message,
            reqId: error.meta?.request_id,
          });
        } else {
          // Hide technical errors in production
          setGlobalError({ 
            message: isDev ? error.message : "Terjadi kendala saat menghubungi server. Silakan coba beberapa saat lagi." 
          });
        }
        feedback.error("Gagal memulai analisis", error);
      },
    });
  };

  if (mutation.isPending || isRedirecting) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <AiAnalysisWorkspace 
          companyName={control._formValues.company_name || ""} 
          status="initializing" 
          progress={0} 
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {globalError && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex flex-col gap-1">
          <p className="font-semibold">{globalError.message}</p>
          {globalError.reqId && (
            <p className="text-xs opacity-80 font-mono">ID Permintaan: {globalError.reqId}</p>
          )}
        </div>
      )}

      {/* Section 1: Informasi Utama */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <BuildingIcon className="size-5 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight">Informasi Perusahaan</h3>
        </div>
        
        <FieldGroup>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="company_name">Nama Perusahaan <span className="text-destructive">*</span></FieldLabel>
              <Input id="company_name" {...register("company_name")} disabled={mutation.isPending} placeholder="Contoh: PT Teknologi Nusantara" className="bg-background" />
              <FieldError errors={[errors.company_name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="legal_entity">Entitas Hukum <span className="text-muted-foreground font-normal text-xs ml-1">(Opsional)</span></FieldLabel>
              <Input id="legal_entity" {...register("legal_entity")} disabled={mutation.isPending} placeholder="Contoh: PT, Tbk, LLC" className="bg-background" />
              <FieldError errors={[errors.legal_entity]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="industry">Sektor Industri <span className="text-destructive">*</span></FieldLabel>
              <Input id="industry" {...register("industry")} disabled={mutation.isPending} placeholder="Contoh: Financial Technology" className="bg-background" />
              <FieldError errors={[errors.industry]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="website">Website Resmi <span className="text-muted-foreground font-normal text-xs ml-1">(Opsional)</span></FieldLabel>
              <Input id="website" type="url" {...register("website")} disabled={mutation.isPending} placeholder="https://..." className="bg-background" />
              <FieldError errors={[errors.website]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="country">Negara <span className="text-destructive">*</span></FieldLabel>
              <Input id="country" {...register("country")} disabled={mutation.isPending} placeholder="Contoh: Indonesia" className="bg-background" />
              <FieldError errors={[errors.country]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Lokasi Spesifik <span className="text-muted-foreground font-normal text-xs ml-1">(Opsional)</span></FieldLabel>
              <Input id="location" {...register("location")} disabled={mutation.isPending} placeholder="Contoh: Jakarta Selatan" className="bg-background" />
              <FieldError errors={[errors.location]} />
            </Field>
          </div>
        </FieldGroup>
      </div>

      {/* Section 2: Tujuan Analisis */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <TargetIcon className="size-5 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight">Fokus Analisis</h3>
        </div>
        
        <FieldGroup>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <Field>
              <FieldLabel>Tujuan Analisis <span className="text-destructive">*</span></FieldLabel>
              <Select 
                value={selectedGoal} 
                onValueChange={(v) => setValue("analysis_goal", v as AnalysisGoal)} 
                disabled={mutation.isPending}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih tujuan analisis...">
                    {selectedGoal ? (
                      analysisGoals.find((goal) => goal.value === selectedGoal)?.label
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {analysisGoals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      <div className="flex flex-col gap-0.5 py-0.5">
                        <span className="font-medium">{goal.label}</span>
                        <span className="text-xs text-muted-foreground">{goal.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.analysis_goal]} />
            </Field>

            <Field>
              <FieldLabel>Tipe Perusahaan</FieldLabel>
              <Select defaultValue="unknown" onValueChange={(v) => setValue("company_type", v as CompanyType)} disabled={mutation.isPending}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih tipe..." />
                </SelectTrigger>
                <SelectContent>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.company_type]} />
            </Field>
            
            <Field>
              <FieldLabel>Kode Saham (Ticker) <span className="text-muted-foreground font-normal text-xs ml-1">(Bila Tbk)</span></FieldLabel>
              <Input id="ticker" {...register("ticker")} disabled={mutation.isPending} placeholder="Contoh: BBCA" className="bg-background" />
              <FieldError errors={[errors.ticker]} />
            </Field>

            <Field>
              <FieldLabel>Bahasa Laporan Akhir</FieldLabel>
              <Select defaultValue="id" onValueChange={(v) => setValue("language", v as ReportLanguage)} disabled={mutation.isPending}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih bahasa output..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English (Inggris)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.language]} />
            </Field>
          </div>
        </FieldGroup>
      </div>

      {/* Section 3: Konteks Spesifik (Advanced) */}
      <div className="space-y-4">
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-5 py-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <SparklesIcon className="size-4" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Tambahkan Konteks Khusus (Opsional)</h4>
              <p className="text-xs text-muted-foreground">Berikan panduan ekstra atau fakta internal agar AI lebih fokus</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUpIcon className="size-5 text-muted-foreground" /> : <ChevronDownIcon className="size-5 text-muted-foreground" />}
        </button>
        
        {showAdvanced && (
          <div className="rounded-xl border border-border/70 bg-card p-5 animate-in slide-in-from-top-2 fade-in duration-200">
            <Field>
              <FieldLabel>Variabel Konteks (Key-Value)</FieldLabel>
              <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                Gunakan fitur ini untuk mendefinisikan informasi internal yang tidak tersedia di publik (misal: "Revenue 2023" = "Rp 50M", atau "Fokus Target" = "Infrastruktur Cloud").
              </p>
              <Controller
                control={control}
                name="target_context_kv"
                render={({ field }) => (
                  <KeyValueEditor
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={mutation.isPending}
                    addButtonLabel="Tambah Variabel Konteks"
                  />
                )}
              />
              <FieldError errors={[errors.target_context_kv]} />
            </Field>
          </div>
        )}
      </div>

      <div className="pt-4 border-t flex flex-col sm:flex-row items-center gap-4 justify-end">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          size="lg"
          className="w-full sm:w-auto px-8 font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            Mulai Analisis
          </span>
        </Button>
      </div>
    </form>
  );
}
