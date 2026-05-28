import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ApiClientError,
  ApiEnvelope,
  AnalysisDataGap,
  AnalysisReportDetail,
  AnalysisRunDetail,
  AnalysisRunListItem,
  AnalysisRunResult,
  AnalysisSource,
  AnalysisSourcesDetail,
  ExternalAnalysisRequest,
  SubmitContextAnswersRequest,
} from "@/types/api";
import { AnalysisChartsResponse, AnalysisUsageResponse } from "@/types/api";

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
      queryClient.setQueryData(queryKeys.analysis.sources(data.analysis_public_id), {
        analysis_public_id: data.analysis_public_id,
        status: data.status,
        report_summary: data.report_summary,
        sources: data.sources,
        data_gaps: data.data_gaps,
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

export function useAnalysisReportQuery(publicId: string, options?: { refetchInterval?: number | false | ((query: any) => number | false | undefined) }) {
  return useQuery({
    queryKey: queryKeys.analysis.report(publicId),
    queryFn: () => fetchAnalysisReport(publicId),
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    ...options,
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

export function useAnalysisDetailQuery(publicId: string, options?: { refetchInterval?: number | false | ((query: any) => number | false | undefined) }) {
  return useQuery({
    queryKey: queryKeys.analysis.detail(publicId),
    queryFn: () => fetchAnalysisDetail(publicId),
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

async function fetchAnalysisSources(publicId: string): Promise<AnalysisSourcesDetail> {
  const res = await fetch(`/api/analysis/runs/${publicId}/sources`);
  const data = (await res.json()) as ApiEnvelope<
    AnalysisSourcesDetail | AnalysisSource[] | { sources?: AnalysisSource[]; data_gaps?: AnalysisDataGap[] }
  >;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis sources"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }

  const payload = data.data;

  if (Array.isArray(payload)) {
    return {
      analysis_public_id: publicId,
      status: "completed",
      sources: payload,
      data_gaps: [],
      report_summary: null,
    };
  }

  if ("sources" in payload && Array.isArray(payload.sources)) {
    return {
      analysis_public_id: "analysis_public_id" in payload && typeof payload.analysis_public_id === "string"
        ? payload.analysis_public_id
        : publicId,
      status: "status" in payload && typeof payload.status === "string" ? payload.status : "completed",
      report_summary:
        "report_summary" in payload && payload.report_summary && typeof payload.report_summary === "object"
          ? payload.report_summary
          : null,
      sources: payload.sources,
      data_gaps: Array.isArray(payload.data_gaps) ? payload.data_gaps : [],
    };
  }

  return {
    analysis_public_id: publicId,
    status: "completed",
    report_summary: null,
    sources: [],
    data_gaps: [],
  };
}

export function useAnalysisSourcesQuery(publicId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.sources(publicId),
    queryFn: () => fetchAnalysisSources(publicId),
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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

async function fetchAnalysisCharts(publicId: string): Promise<AnalysisChartsResponse> {
  const res = await fetch(`/api/analysis/runs/${publicId}/charts`);
  const data = (await res.json()) as ApiEnvelope<AnalysisChartsResponse>;
  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis charts"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }
  return data.data;
}

export function useAnalysisChartsQuery(publicId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.charts(publicId),
    queryFn: () => fetchAnalysisCharts(publicId),
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

async function fetchAnalysisUsage(publicId: string): Promise<AnalysisUsageResponse> {
  const res = await fetch(`/api/analysis/runs/${publicId}/usage`);
  const data = (await res.json()) as ApiEnvelope<AnalysisUsageResponse>;
  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to fetch analysis usage"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }
  return data.data;
}

export function useAnalysisUsageQuery(publicId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.usage(publicId),
    queryFn: () => fetchAnalysisUsage(publicId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

async function submitContextAnswers(params: { publicId: string; payload: SubmitContextAnswersRequest }): Promise<void> {
  const res = await fetch(`/api/analysis/runs/${params.publicId}/context-answers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.payload),
  });

  const data = (await res.json()) as ApiEnvelope<void>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, "Failed to submit context answers"),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }
}

export function useSubmitContextAnswersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitContextAnswers,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.detail(variables.publicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.report(variables.publicId) });
    },
  });
}
