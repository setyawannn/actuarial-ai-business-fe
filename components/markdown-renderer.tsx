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

  let inTable = false;
  let tableLines: string[] = [];
  let validDataRowsCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      inTable = true;
      tableLines.push(line);

      // Check if it's a separator row (e.g. |---|---|)
      const isSeparator = trimmed.replace(/[\s|:-]/g, "") === "";

      // If it's a data row (not header and not separator)
      if (tableLines.length > 2 && !isSeparator) {
        const cells = trimmed
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);

        if (cells.length >= 2) {
          const valueCells = cells.slice(1);
          if (!valueCells.every((cell) => shouldHideValue(cell))) {
            validDataRowsCount++;
          } else {
            // Row is hidden (all values are empty/NA), remove it
            tableLines.pop();
          }
        } else {
          validDataRowsCount++;
        }
      }
    } else {
      if (inTable) {
        // Table block ended
        if (validDataRowsCount > 0) {
          cleaned.push(...tableLines);
        }
        inTable = false;
        tableLines = [];
        validDataRowsCount = 0;
      }

      // Normal lines
      if (!trimmed) {
        cleaned.push(line);
        continue;
      }

      // Check for raw JSON stringified objects and convert them to markdown
      let jsonCandidate = trimmed;
      if (jsonCandidate.endsWith(",")) {
        jsonCandidate = jsonCandidate.slice(0, -1).trim();
      }

      if (jsonCandidate.startsWith("{") && jsonCandidate.endsWith("}")) {
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            const keys = Object.keys(parsed);
            if (keys.length > 0) {
              cleaned.push(`- **${keys[0].charAt(0).toUpperCase() + keys[0].slice(1)}**: ${parsed[keys[0]]}`);
              for (let k = 1; k < keys.length; k++) {
                cleaned.push(`  - **${keys[k].charAt(0).toUpperCase() + keys[k].slice(1)}**: ${parsed[keys[k]]}`);
              }
              continue;
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Hide standalone JSON array brackets if they are just [ or ]
      if (trimmed === "[" || trimmed === "]") {
        continue;
      }

      if (trimmed.startsWith("- ")) {
        const bullet = trimmed.slice(2).trim();
        if (shouldHideValue(bullet)) {
          continue;
        }
      }

      // Only check key-value pairs if there's a colon and it's not a URL
      if (trimmed.includes(":") && !trimmed.startsWith("http")) {
        const colonIndex = trimmed.indexOf(":");
        const value = trimmed.slice(colonIndex + 1).trim();
        // Be careful not to hide normal text that just happens to have a colon
        // Ensure it looks like a field "Key: Value"
        if (value && shouldHideValue(value) && colonIndex < 40) {
          continue;
        }
      }

      cleaned.push(line);
    }
  }

  if (inTable && validDataRowsCount > 0) {
    cleaned.push(...tableLines);
  }

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words w-full min-w-0 [&_pre]:overflow-x-auto [&_pre]:max-w-full">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-6">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="border-b border-border/80 px-4 py-3 font-semibold text-foreground" {...props} />,
          td: ({ node, ...props }) => <td className="border-b border-border/40 px-4 py-3 text-muted-foreground" {...props} />,
        }}
      >
        {cleanReportMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
