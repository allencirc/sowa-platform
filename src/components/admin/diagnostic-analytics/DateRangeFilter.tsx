"use client";

import { cn } from "@/lib/utils";

export interface DateRange {
  preset?: "7d" | "28d" | "90d";
  from?: string;
  to?: string;
}

const presets: { label: string; value: DateRange["preset"] }[] = [
  { label: "7 days", value: "7d" },
  { label: "28 days", value: "28d" },
  { label: "90 days", value: "90d" },
];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange({ preset: p.value })}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value.preset === p.value && !value.from
              ? "bg-primary text-white"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200",
          )}
        >
          {p.label}
        </button>
      ))}
      <span className="mx-1 text-xs text-text-muted">or</span>
      <input
        type="date"
        aria-label="From date"
        value={value.from ?? ""}
        onChange={(e) =>
          onChange({ from: e.target.value, to: value.to ?? new Date().toISOString().split("T")[0] })
        }
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-text-primary"
      />
      <span className="text-xs text-text-muted">to</span>
      <input
        type="date"
        aria-label="To date"
        value={value.to ?? ""}
        onChange={(e) => onChange({ from: value.from, to: e.target.value })}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-text-primary"
      />
    </div>
  );
}
