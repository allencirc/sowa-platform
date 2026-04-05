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

// Note: Badges use a 10%-tint background for colour coding, but the text is
// always the dark navy `text-text-primary` (~13:1 on tint). Using the brand
// colour as text on its own tint only reaches ~2.8:1 and fails WCAG 2.2 AA.
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-text-primary",
  primary: "bg-primary/10 text-text-primary",
  secondary: "bg-secondary/10 text-text-primary",
  accent: "bg-accent/10 text-text-primary",
  operations: "bg-sector-operations/10 text-text-primary",
  marine: "bg-sector-marine/10 text-text-primary",
  electrical: "bg-sector-electrical/10 text-text-primary",
  "survey-design": "bg-sector-survey-design/10 text-text-primary",
  hse: "bg-sector-hse/10 text-text-primary",
  policy: "bg-sector-policy/10 text-text-primary",
  "project-management": "bg-sector-project-management/10 text-text-primary",
  warning: "bg-status-warning/10 text-text-primary",
  error: "bg-status-error/10 text-text-primary",
  success: "bg-status-success/10 text-text-primary",
  info: "bg-status-info/10 text-text-primary",
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
