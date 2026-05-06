"use client";

import { useAnalysisReportQuery } from "@/hooks/use-analysis";
import { PageHeader } from "@/components/page-header";
import { NotFoundState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangleIcon, CheckCircleIcon, FileTextIcon, DatabaseIcon, InfoIcon } from "lucide-react";
import { ApiClientError } from "@/types/api";

export function AnalysisDetailClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisReportQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.code === "ANALYSIS_NOT_FOUND") {
      return <NotFoundState />;
    }
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive border border-destructive/20">
        <p className="font-medium">Error loading analysis</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { status, report_summary, scores } = data;
  
  if (!report_summary) {
    return (
      <div className="space-y-6">
        <PageHeader title="Processing..." description={`Status: ${status}`} />
        <Card>
          <CardContent className="pt-6">
            Report summary is not yet available.
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderConfidenceLabel = (confidence: string | null | undefined) => {
    if (!confidence) return null;
    const lower = confidence.toLowerCase();
    if (["low", "unknown", "partial", "insufficient"].includes(lower)) {
      return (
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-3 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
          <AlertTriangleIcon className="size-4 shrink-0" />
          Forecast bersifat kualitatif dan bukan prediksi presisi
        </span>
      );
    }
    return null;
  };

  const getRiskBadgeColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("high") || l.includes("critical")) return "destructive";
    if (l.includes("medium") || l.includes("moderate")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={report_summary.company_name || "Unknown Company"}
        description={`Goal: ${report_summary.analysis_goal || "N/A"}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}/report`}>
                <FileTextIcon className="size-4 mr-2" /> Full Report
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}/sources`}>
                <DatabaseIcon className="size-4 mr-2" /> Sources
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={status === "completed" ? "default" : "secondary"}>
            {status.toUpperCase()}
          </Badge>
          {report_summary.overall_risk_level && (
            <Badge variant={getRiskBadgeColor(report_summary.overall_risk_level)}>
              Risk: {report_summary.overall_risk_level}
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores?.overall_risk_score ?? "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores?.confidence_score ?? "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Availability Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores?.data_availability_score ?? "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Overall Conclusion</h4>
            <p className="text-sm leading-relaxed">{report_summary.overall_conclusion || "No conclusion provided."}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Top Findings</h4>
              {report_summary.top_findings?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {report_summary.top_findings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No top findings recorded.</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Top Risks</h4>
              {report_summary.top_risks?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {report_summary.top_risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No top risks recorded.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations & Next Steps */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {report_summary.recommendations?.length > 0 ? (
              <ul className="space-y-3">
                {report_summary.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <CheckCircleIcon className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No recommendations provided.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {report_summary.next_steps?.length > 0 ? (
              <ul className="space-y-3">
                {report_summary.next_steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <InfoIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No next steps provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast & Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast & Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Historical 3-Year Summary</h4>
              <p className="text-sm leading-relaxed">{report_summary.historical_3y_summary || <span className="italic text-muted-foreground">No historical data available.</span>}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Forecast 3-Year Summary</h4>
              <p className="text-sm leading-relaxed">{report_summary.forecast_3y_summary || <span className="italic text-muted-foreground">No forecast data available.</span>}</p>
              {renderConfidenceLabel(report_summary.forecast_confidence)}
            </div>
          </div>

          {(report_summary.forecast_methods_used?.length > 0 || report_summary.scenario_highlights?.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
              {report_summary.forecast_methods_used?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Methods Used</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {report_summary.forecast_methods_used.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
              {report_summary.scenario_highlights?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Scenario Highlights</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {report_summary.scenario_highlights.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Limitations & Data Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Limitations & Data Gaps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Key Limitations</h4>
            {report_summary.key_limitations?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {report_summary.key_limitations.map((lim, i) => <li key={i}>{lim}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No key limitations identified.</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Data Requests</h4>
            {report_summary.data_requests?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {report_summary.data_requests.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No further data requests.</p>
            )}
          </div>
          
          {data.data_gaps?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Specific Data Gaps</h4>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Missing Item</th>
                      <th className="px-4 py-2 text-left font-medium">Importance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.data_gaps.map((gap, i) => (
                      <tr key={gap.id || i}>
                        <td className="px-4 py-2">{gap.missing_item}</td>
                        <td className="px-4 py-2">
                          <Badge variant={gap.importance?.toLowerCase() === "high" || gap.importance?.toLowerCase() === "critical" ? "destructive" : "secondary"}>
                            {gap.importance || "Unknown"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
