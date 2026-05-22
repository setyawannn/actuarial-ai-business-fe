"use client";

import { GripVerticalIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptVariable } from "@/lib/prompt-editor";

export function PromptVariableList({
  variables,
  onInsert,
}: {
  variables: PromptVariable[];
  onInsert: (token: string) => void;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b">
        <CardTitle className="text-sm">Quick insert</CardTitle>
        <CardDescription>
          Klik untuk insert ke cursor, atau drag ke editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 pt-4">
        {variables.map((variable) => (
          <button
            key={`quick-${variable.key}`}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", variable.token);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onInsert(variable.token)}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-left transition hover:bg-muted/40"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{variable.label}</span>
              <span className="block truncate font-mono text-xs text-muted-foreground">
                {variable.token}
              </span>
            </span>
            <GripVerticalIcon className="size-4 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
