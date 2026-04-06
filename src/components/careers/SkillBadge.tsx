import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/types";

const categoryStyles: Record<string, string> = {
  Technical: "bg-accent/10 text-accent-dark",
  Safety: "bg-status-error/10 text-status-error",
  Regulatory: "bg-sector-policy/10 text-sector-policy",
  Digital: "bg-sector-survey-design/10 text-sector-survey-design",
  Management: "bg-sector-project-management/10 text-sector-project-management",
};

interface SkillBadgeProps {
  skill: Skill;
  className?: string;
}

export function SkillBadge({ skill, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        categoryStyles[skill.category] ?? "bg-gray-100 text-text-secondary",
        className,
      )}
    >
      {skill.name}
    </span>
  );
}
