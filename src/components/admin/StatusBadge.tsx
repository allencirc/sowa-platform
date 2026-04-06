"use client";

import { FileEdit, Eye, CheckCircle2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; icon: typeof FileEdit; className: string }
> = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: Eye,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PUBLISHED: {
    label: "Published",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

interface StatusBadgeProps {
  status: ContentStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
}
