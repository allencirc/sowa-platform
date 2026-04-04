import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "operations"
  | "marine"
  | "electrical"
  | "survey-design"
  | "hse"
  | "policy"
  | "project-management"
  | "warning"
  | "error"
  | "success"
  | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-text-secondary",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary-dark",
  accent: "bg-accent/10 text-accent-dark",
  operations: "bg-sector-operations/10 text-sector-operations",
  marine: "bg-sector-marine/10 text-sector-marine",
  electrical: "bg-sector-electrical/10 text-sector-electrical",
  "survey-design": "bg-sector-survey-design/10 text-sector-survey-design",
  hse: "bg-sector-hse/10 text-sector-hse",
  policy: "bg-sector-policy/10 text-sector-policy",
  "project-management": "bg-sector-project-management/10 text-sector-project-management",
  warning: "bg-status-warning/10 text-status-warning",
  error: "bg-status-error/10 text-status-error",
  success: "bg-status-success/10 text-status-success",
  info: "bg-status-info/10 text-status-info",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const sectorBadgeMap: Record<string, BadgeVariant> = {
  "Operations & Maintenance": "operations",
  "Marine Operations": "marine",
  Electrical: "electrical",
  "Survey & Design": "survey-design",
  "Health, Safety & Environment": "hse",
  "Policy & Regulation": "policy",
  "Project Management": "project-management",
};

export function SectorBadge({ sector }: { sector: string }) {
  const variant = sectorBadgeMap[sector] ?? "default";
  return <Badge variant={variant}>{sector}</Badge>;
}
