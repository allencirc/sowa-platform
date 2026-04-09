"use client";

import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  { label: "Conference", colorClass: "bg-primary" },
  { label: "Webinar", colorClass: "bg-accent" },
  { label: "Workshop", colorClass: "bg-secondary" },
  { label: "Networking", colorClass: "bg-status-info" },
  { label: "Training", colorClass: "bg-status-warning" },
  { label: "Roadshow", colorClass: "bg-accent-light" },
  { label: "Course", colorClass: "bg-[#7C3AED]" },
] as const;

interface CalendarLegendProps {
  className?: string;
}

export function CalendarLegend({ className }: CalendarLegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary", className)}>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={cn("w-2.5 h-2.5 rounded-full", item.colorClass)} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
