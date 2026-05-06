import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiEnvelope, ExternalAnalysisRequest, AnalysisRunResult, AnalysisRunDetail, ApiClientError } from "@/types/api";

async function createAnalysisRun(payload: ExternalAnalysisRequest): Promise<AnalysisRunResult> {
  const res = await fetch("/api/analysis/external/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as ApiEnvelope<AnalysisRunResult>;

  if (!data.success) {
    throw new ApiClientError(
      data.error?.message || "Failed to create analysis run",
      data.error?.code || "UNKNOWN",
      data.meta
    );
  }

  return data.data;
}

export function useCreateAnalysisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnalysisRun,
    retry: 0,
    onSuccess: (data) => {
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.history() });

      // Prefetch or prefill the data for the new run
      queryClient.setQueryData(queryKeys.analysis.report(data.analysis_public_id), data);
      
      // We can also set partial overview data if needed
      // Map to detail structure if needed, or just let it fetch detail separately
    },
  });
}

async function fetchAnalysisReport(publicId: string): Promise<AnalysisRunResult> {
  const res = await fetch(`/api/analysis/runs/${publicId}/report`);
  const data = (await res.json()) as ApiEnvelope<AnalysisRunResult>;

  if (!data.success) {
    throw new ApiClientError(
      data.error?.message || "Failed to fetch analysis report",
      data.error?.code || "UNKNOWN",
      data.meta
    );
  }

  return data.data;
}

export function useAnalysisReportQuery(publicId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.report(publicId),
    queryFn: () => fetchAnalysisReport(publicId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchAnalysisDetail(publicId: string): Promise<AnalysisRunDetail> {
  const res = await fetch(`/api/analysis/runs/${publicId}`);
  const data = (await res.json()) as ApiEnvelope<AnalysisRunDetail>;

  if (!data.success) {
    throw new ApiClientError(
      data.error?.message || "Failed to fetch analysis detail",
      data.error?.code || "UNKNOWN",
      data.meta
    );
  }

  return data.data;
}

export function useAnalysisDetailQuery(publicId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.detail(publicId),
    queryFn: () => fetchAnalysisDetail(publicId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
