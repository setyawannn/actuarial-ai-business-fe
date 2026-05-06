"use client";

import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  DatabaseIcon,
  FileTextIcon,
  LightbulbIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { useAnalysisReportQuery } from "@/hooks/use-analysis";
import { useAnalysisDetailQuery } from "@/hooks/use-analysis";
import { ApiClientError, AnalysisDataGap, AnalysisReportDetail, AnalysisRunResult, AnalysisScores } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { NotFoundState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function hasText(value?: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();

  return normalized !== "" && normalized !== "n/a" && normalized !== "na" && normalized !== "unknown";
}

function cleanList(values?: string[] | null) {
  return (values ?? []).filter((value) => hasText(value));
}

function isQualitativeForecast(confidence?: string | null) {
  if (!confidence) return false;

  return ["low", "unknown", "partial", "insufficient"].includes(confidence.trim().toLowerCase());
}

function scoreCards(scores?: AnalysisScores) {
  return [
    {
      label: "Overall Risk",
      value: scores?.overall_risk_score,
      tone: "text-foreground",
    },
    {
      label: "Confidence",
      value: scores?.confidence_score,
      tone: "text-foreground",
    },
    {
      label: "Data Availability",
      value: scores?.data_availability_score,
      tone: "text-foreground",
    },
  ].filter((item) => item.value !== null && item.value !== undefined);
}

function detailSections(reportSummary: NonNullable<ReturnType<typeof extractSummary>>) {
  return [
    {
      title: "Top Findings",
      items: cleanList(reportSummary.top_findings),
      icon: <LightbulbIcon className="size-4" />,
    },
    {
      title: "Top Risks",
      items: cleanList(reportSummary.top_risks),
      icon: <ShieldAlertIcon className="size-4" />,
    },
    {
      title: "Recommendations",
      items: cleanList(reportSummary.recommendations),
      icon: <ArrowRightIcon className="size-4" />,
    },
    {
      title: "Limitations",
      items: cleanList(reportSummary.key_limitations),
      icon: <AlertTriangleIcon className="size-4" />,
    },
  ].filter((section) => section.items.length > 0);
}

function extractSummary(data: {
  report_summary: {
    company_name: string;
    analysis_goal: string;
    overall_conclusion: string;
    overall_risk_level: string;
    data_confidence: string;
    top_findings: string[];
    top_risks: string[];
    recommendations: string[];
    key_limitations: string[];
    data_requests: string[];
    next_steps: string[];
    historical_3y_summary?: string | null;
    forecast_3y_summary?: string | null;
    forecast_confidence?: string | null;
    forecast_methods_used: string[];
    scenario_highlights: string[];
  } | null;
}) {
  return data.report_summary;
}

function renderGapRows(dataGaps: AnalysisDataGap[]) {
  return dataGaps.filter(
    (gap) =>
      hasText(gap.missing_item) ||
      hasText(gap.reason) ||
      hasText(gap.recommended_action) ||
      hasText(gap.importance)
  );
}

export function AnalysisDetailClient({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAnalysisReportQuery(publicId);
  const detailQuery = useAnalysisDetailQuery(publicId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiClientError && error.code === "ANALYSIS_NOT_FOUND") {
      return <NotFoundState />;
    }

    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">
        <p className="font-medium">Error loading analysis</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const summary = extractSummary(data);

  if (!summary) {
    return <NotFoundState />;
  }

  const reportLikeData = data as AnalysisReportDetail & Partial<AnalysisRunResult>;

  const cards = scoreCards(
    reportLikeData.scores ?? {
      overall_risk_score: detailQuery.data?.overall_risk_score ?? null,
      confidence_score: detailQuery.data?.confidence_score ?? null,
      data_availability_score: detailQuery.data?.data_availability_score ?? null,
    }
  );
  const sections = detailSections(summary);
  const dataRequests = cleanList(summary.data_requests);
  const nextSteps = cleanList(summary.next_steps);
  const forecastMethods = cleanList(summary.forecast_methods_used);
  const scenarioHighlights = cleanList(summary.scenario_highlights);
  const dataGaps = renderGapRows(reportLikeData.data_gaps ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={summary.company_name}
        description={summary.analysis_goal.replaceAll("_", " ")}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}/report`}>
                <FileTextIcon className="mr-2 size-4" />
                Full Report
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/analysis/${publicId}/sources`}>
                <DatabaseIcon className="mr-2 size-4" />
                Sources
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={(summary.overall_risk_level || "").includes("high") ? "destructive" : "secondary"}>
          {summary.overall_risk_level || data.status}
        </Badge>
        {hasText(summary.data_confidence) ? (
          <Badge variant="outline">Confidence: {summary.data_confidence}</Badge>
        ) : null}
      </div>

      {cards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-semibold ${card.tone}`}>{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {hasText(summary.overall_conclusion) ? (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{summary.overall_conclusion}</p>
          </CardContent>
        </Card>
      ) : null}

      {sections.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {section.items.map((item, index) => (
                    <li key={`${section.title}-${index}`} className="rounded-xl bg-muted/40 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {(hasText(summary.historical_3y_summary) ||
        hasText(summary.forecast_3y_summary) ||
        forecastMethods.length > 0 ||
        scenarioHighlights.length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>Forecast and Outlook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {hasText(summary.historical_3y_summary) ? (
                <div className="space-y-2 rounded-2xl border border-border/70 p-4">
                  <p className="text-sm font-medium text-foreground">Historical 3-Year Summary</p>
                  <p className="text-sm leading-6 text-muted-foreground">{summary.historical_3y_summary}</p>
                </div>
              ) : null}

              {hasText(summary.forecast_3y_summary) ? (
                <div className="space-y-2 rounded-2xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Forecast 3-Year Summary</p>
                    {hasText(summary.forecast_confidence) ? (
                      <Badge variant="outline">{summary.forecast_confidence}</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{summary.forecast_3y_summary}</p>
                  {isQualitativeForecast(summary.forecast_confidence) ? (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                      <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                      <span>Forecast ini sebaiknya dibaca sebagai guidance kualitatif, bukan prediksi presisi.</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {forecastMethods.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Methods Used</p>
                <div className="flex flex-wrap gap-2">
                  {forecastMethods.map((method, index) => (
                    <Badge key={`method-${index}`} variant="secondary">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {scenarioHighlights.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Scenario Highlights</p>
                <div className="space-y-2">
                  {scenarioHighlights.map((item, index) => (
                    <div key={`scenario-${index}`} className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {(dataRequests.length > 0 || nextSteps.length > 0) ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {dataRequests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Data Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {dataRequests.map((item, index) => (
                    <li key={`request-${index}`} className="rounded-xl bg-muted/40 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {nextSteps.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {nextSteps.map((item, index) => (
                    <li key={`next-${index}`} className="rounded-xl bg-muted/40 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {dataGaps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Data Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Missing Item</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Recommended Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataGaps.map((gap, index) => (
                  <TableRow key={`${gap.missing_item}-${index}`}>
                    <TableCell className="whitespace-normal font-medium">{gap.missing_item}</TableCell>
                    <TableCell className="whitespace-normal">{gap.importance || "-"}</TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {gap.reason || "-"}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {gap.recommended_action || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
