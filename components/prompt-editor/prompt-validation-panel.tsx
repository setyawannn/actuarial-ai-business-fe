"use client";

import { TriangleAlertIcon } from "lucide-react";

import { InfoTooltip } from "@/components/info-tooltip";
import { PromptValidationResult } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PromptValidationPanel({
  result,
}: {
  result: PromptValidationResult;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b">
        <CardTitle className="text-sm">Validation result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Missing required variables
          </p>
          {result.missing_required_variables.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.missing_required_variables.map((item) => (
                <Badge key={item} variant="destructive">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Tidak ada variable wajib yang hilang.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Unknown tokens
          </p>
          {result.unknown_tokens.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.unknown_tokens.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Semua token dikenali backend.</p>
          )}
        </div>
        <div>
          <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Warnings
            <InfoTooltip content="Warning tidak selalu memblokir save, tapi bagus untuk dicek sebelum activate." />
          </p>
          {result.warnings.length ? (
            <div className="mt-2 space-y-2">
              {result.warnings.map((warning, index) => (
                <div
                  key={`${warning}-${index}`}
                  className="flex gap-2 rounded-lg border border-border/70 p-3 text-sm"
                >
                  <TriangleAlertIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Tidak ada warning dari backend.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
