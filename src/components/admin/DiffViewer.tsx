"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  oldData: Record<string, unknown>;
  newData: Record<string, unknown>;
  oldLabel?: string;
  newLabel?: string;
}

interface DiffLine {
  key: string;
  type: "added" | "removed" | "changed" | "unchanged";
  oldValue?: string;
  newValue?: string;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringify).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Object]";
    }
  }
  return String(value);
}

// Keys to skip in diff display (internal/meta fields)
const SKIP_KEYS = new Set(["id", "createdAt", "updatedAt", "publishAt", "rejectionNote", "status"]);

function computeDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): DiffLine[] {
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const lines: DiffLine[] = [];

  for (const key of allKeys) {
    if (SKIP_KEYS.has(key)) continue;

    const oldVal = stringify(oldData[key]);
    const newVal = stringify(newData[key]);

    if (!(key in oldData)) {
      lines.push({ key, type: "added", newValue: newVal });
    } else if (!(key in newData)) {
      lines.push({ key, type: "removed", oldValue: oldVal });
    } else if (oldVal !== newVal) {
      lines.push({ key, type: "changed", oldValue: oldVal, newValue: newVal });
    }
    // Skip unchanged fields to keep diff concise
  }

  return lines;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

export function DiffViewer({
  oldData,
  newData,
  oldLabel = "Previous",
  newLabel = "Current",
}: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(oldData, newData), [oldData, newData]);

  if (diff.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-text-muted">
        No differences found between these versions.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Header */}
      <div className="grid grid-cols-[180px_1fr_1fr] border-b border-gray-200 bg-gray-50 text-xs font-medium text-text-secondary">
        <div className="px-3 py-2">Field</div>
        <div className="border-l border-gray-200 px-3 py-2">{oldLabel}</div>
        <div className="border-l border-gray-200 px-3 py-2">{newLabel}</div>
      </div>

      {/* Diff rows */}
      <div className="divide-y divide-gray-100">
        {diff.map((line) => (
          <div
            key={line.key}
            className="grid grid-cols-[180px_1fr_1fr] text-sm"
          >
            <div className="flex items-start px-3 py-2 font-medium text-text-primary">
              {formatKey(line.key)}
            </div>

            {/* Old value column */}
            <div
              className={cn(
                "border-l border-gray-100 px-3 py-2",
                line.type === "removed" && "bg-red-50",
                line.type === "changed" && "bg-red-50/50"
              )}
            >
              {(line.type === "removed" || line.type === "changed") && (
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-red-500">
                    −
                  </span>
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-700">
                    {line.oldValue}
                  </pre>
                </div>
              )}
              {line.type === "added" && (
                <span className="text-xs text-text-muted">—</span>
              )}
            </div>

            {/* New value column */}
            <div
              className={cn(
                "border-l border-gray-100 px-3 py-2",
                line.type === "added" && "bg-green-50",
                line.type === "changed" && "bg-green-50/50"
              )}
            >
              {(line.type === "added" || line.type === "changed") && (
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-green-600">
                    +
                  </span>
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-green-700">
                    {line.newValue}
                  </pre>
                </div>
              )}
              {line.type === "removed" && (
                <span className="text-xs text-text-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex gap-4 border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-text-secondary">
        <span>
          {diff.filter((d) => d.type === "added").length} added
        </span>
        <span>
          {diff.filter((d) => d.type === "removed").length} removed
        </span>
        <span>
          {diff.filter((d) => d.type === "changed").length} changed
        </span>
      </div>
    </div>
  );
}
