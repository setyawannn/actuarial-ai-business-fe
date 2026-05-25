import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";

function shouldHideValue(value: any) {
  if (!value || typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();

  return (
    normalized === "unknown" ||
    normalized === "n/a" ||
    normalized === "na" ||
    normalized === "not available" ||
    normalized === "no response recorded." ||
    normalized === "no response recorded" ||
    normalized === "false"
  );
}

function cleanReportMarkdown(content: string) {
  const lines = content.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      cleaned.push(line);
      continue;
    }

    if (trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      if (cells.length >= 2) {
        const valueCells = cells.slice(1);
        if (valueCells.every((cell) => shouldHideValue(cell))) {
          continue;
        }
      }
    }

    if (trimmed.startsWith("- ")) {
      const bullet = trimmed.slice(2).trim();
      if (shouldHideValue(bullet)) {
        continue;
      }
    }

    if (trimmed.includes(":")) {
      const value = trimmed.split(":").slice(1).join(":").trim();
      if (value && shouldHideValue(value)) {
        continue;
      }
    }

    cleaned.push(line);
  }

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words w-full min-w-0 overflow-hidden [&_table]:block [&_table]:overflow-x-auto [&_pre]:overflow-x-auto [&_pre]:max-w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanReportMarkdown(content)}</ReactMarkdown>
    </div>
  );
}
