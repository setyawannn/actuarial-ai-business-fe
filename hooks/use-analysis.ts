import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ApiClientError,
  ApiEnvelope,
  AnalysisReportDetail,
  AnalysisRunDetail,
  AnalysisRunListItem,
  AnalysisRunResult,
  ExternalAnalysisRequest,
} from "@/types/api";

function getEnvelopeErrorMessage<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) {
    return fallback;
  }

  return data.message || data.error?.message || data.errors?.[0]?.message || fallback;
}

function getEnvelopeErrorCode<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) {
    return fallback;
  }

  return data.code || data.error?.code || fallback;
}

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
      getEnvelopeErrorMessage(data, "Failed to create analysis run"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.history() });
      queryClient.setQueryData(queryKeys.analysis.report(data.analysis_public_id), {
        analysis_public_id: data.analysis_public_id,
        status: data.status,
        report_markdown: data.report_markdown,
        report_summary: data.report_summary,
      });
    },
  });
}

async function fetchAnalysisReport(publicId: string): Promise<AnalysisReportDetail> {
  const res = await fetch(`/api/analysis/runs/${publicId}/report`);
  const data = (await res.json()) as ApiEnvelope<AnalysisReportDetail>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis report"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
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
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

async function fetchAnalysisDetail(publicId: string): Promise<AnalysisRunDetail> {
  const res = await fetch(`/api/analysis/runs/${publicId}`);
  const data = (await res.json()) as ApiEnvelope<AnalysisRunDetail>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis detail"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
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

export interface AnalysisHistoryParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

async function fetchAnalysisHistory(params?: AnalysisHistoryParams): Promise<AnalysisRunListItem[]> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(`/api/analysis/runs${queryString}`);
  const data = (await res.json()) as ApiEnvelope<AnalysisRunListItem[]>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis history"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }

  return data.data;
}

export function useAnalysisHistoryQuery(params?: AnalysisHistoryParams) {
  return useQuery({
    queryKey: queryKeys.analysis.history(params),
    queryFn: () => fetchAnalysisHistory(params),
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
