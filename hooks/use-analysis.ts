import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiEnvelope, ExternalAnalysisRequest, AnalysisRunResult, ApiClientError } from "@/types/api";

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
      queryClient.setQueryData(queryKeys.analysis.detail(data.analysis_public_id), data);
      
      // We can also set partial overview data if needed
    },
  });
}
