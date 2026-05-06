"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAnalysisMutation } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { AnalysisGoal, CompanyType, ReportLanguage, ExternalAnalysisRequest, ApiClientError } from "@/types/api";

const analysisGoals: { value: AnalysisGoal; label: string }[] = [
  { value: "business_health", label: "Business Health" },
  { value: "acquisition_risk", label: "Acquisition Risk" },
  { value: "investment_risk", label: "Investment Risk" },
  { value: "competitor_analysis", label: "Competitor Analysis" },
  { value: "vendor_risk", label: "Vendor Risk" },
  { value: "market_entry", label: "Market Entry" },
  { value: "partnership_risk", label: "Partnership Risk" },
];

const companyTypes: { value: CompanyType; label: string }[] = [
  { value: "private", label: "Private Company" },
  { value: "public", label: "Public Company" },
  { value: "unknown", label: "Unknown" },
];

const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  legal_entity: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  location: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  ticker: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  company_type: z.enum(["private", "public", "unknown"]).optional(),
  analysis_goal: z.enum([
    "business_health",
    "acquisition_risk",
    "investment_risk",
    "competitor_analysis",
    "vendor_risk",
    "market_entry",
    "partnership_risk",
  ], { required_error: "Analysis goal is required" }),
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
  const [globalError, setGlobalError] = React.useState<{ message: string; reqId?: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "en",
    },
  });

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
          // If it fails, keep it as a string
        }
        parsedTargetContext[k] = parsedVal;
      });
    }

    // Clean up empty URL if necessary
    const payload: ExternalAnalysisRequest = {
      ...data,
      website: data.website || undefined,
      legal_entity: data.legal_entity || undefined,
      location: data.location || undefined,
      ticker: data.ticker || undefined,
      target_context: Object.keys(parsedTargetContext).length > 0 ? parsedTargetContext : undefined,
    } as any;
    
    delete (payload as any).target_context_kv;

    mutation.mutate(payload, {
      onSuccess: (result) => {
        router.push(`/analysis/${result.analysis_public_id}`);
      },
      onError: (error: any) => {
        if (error instanceof ApiClientError) {
          setGlobalError({
            message: error.message,
            reqId: error.meta?.request_id,
          });
        } else {
          setGlobalError({ message: error.message || "An unexpected error occurred" });
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {globalError && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20 flex flex-col gap-1">
          <p className="font-medium">{globalError.message}</p>
          {globalError.reqId && (
            <p className="text-xs opacity-80 font-mono">Req ID: {globalError.reqId}</p>
          )}
        </div>
      )}

      <FieldGroup>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Company Name */}
          <Field>
            <FieldLabel htmlFor="company_name">Company Name *</FieldLabel>
            <Input id="company_name" {...register("company_name")} disabled={mutation.isPending} />
            <FieldError errors={[errors.company_name]} />
          </Field>

          {/* Legal Entity */}
          <Field>
            <FieldLabel htmlFor="legal_entity">Legal Entity</FieldLabel>
            <Input id="legal_entity" {...register("legal_entity")} disabled={mutation.isPending} placeholder="e.g. LLC, Inc, PT" />
            <FieldError errors={[errors.legal_entity]} />
          </Field>

          {/* Country */}
          <Field>
            <FieldLabel htmlFor="country">Country *</FieldLabel>
            <Input id="country" {...register("country")} disabled={mutation.isPending} />
            <FieldError errors={[errors.country]} />
          </Field>

          {/* Location */}
          <Field>
            <FieldLabel htmlFor="location">Location (City/State)</FieldLabel>
            <Input id="location" {...register("location")} disabled={mutation.isPending} />
            <FieldError errors={[errors.location]} />
          </Field>

          {/* Industry */}
          <Field>
            <FieldLabel htmlFor="industry">Industry *</FieldLabel>
            <Input id="industry" {...register("industry")} disabled={mutation.isPending} />
            <FieldError errors={[errors.industry]} />
          </Field>

          {/* Website */}
          <Field>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input id="website" type="url" {...register("website")} disabled={mutation.isPending} placeholder="https://..." />
            <FieldError errors={[errors.website]} />
          </Field>
          
          {/* Ticker */}
          <Field>
            <FieldLabel htmlFor="ticker">Stock Ticker</FieldLabel>
            <Input id="ticker" {...register("ticker")} disabled={mutation.isPending} placeholder="e.g. AAPL" />
            <FieldError errors={[errors.ticker]} />
          </Field>

          {/* Company Type */}
          <Field>
            <FieldLabel>Company Type</FieldLabel>
            <Select onValueChange={(v) => setValue("company_type", v as CompanyType)} disabled={mutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
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

          {/* Analysis Goal */}
          <Field>
            <FieldLabel>Analysis Goal *</FieldLabel>
            <Select onValueChange={(v) => setValue("analysis_goal", v as AnalysisGoal)} disabled={mutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {analysisGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.analysis_goal]} />
          </Field>

          {/* Language */}
          <Field>
            <FieldLabel>Report Language</FieldLabel>
            <Select defaultValue="en" onValueChange={(v) => setValue("language", v as ReportLanguage)} disabled={mutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[errors.language]} />
          </Field>
        </div>

        {/* Target Context (Key-Value) */}
        <Field>
          <FieldLabel>Target Context (Variables)</FieldLabel>
          <Controller
            control={control}
            name="target_context_kv"
            render={({ field }) => (
              <KeyValueEditor
                value={field.value || []}
                onChange={field.onChange}
                disabled={mutation.isPending}
                addButtonLabel="Add Variable"
              />
            )}
          />
          <FieldError errors={[errors.target_context_kv]} />
          <FieldDescription>
            Provide any additional target context. Values can be simple strings or valid JSON arrays/objects.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
        {mutation.isPending ? "Starting Analysis..." : "Run Analysis"}
      </Button>

      {mutation.isPending && (
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">
          Submitting request. This might take a while depending on the complexity of the task...
        </p>
      )}
    </form>
  );
}
