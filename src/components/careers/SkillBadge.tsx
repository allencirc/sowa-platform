import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/types";

const categoryStyles: Record<string, string> = {
  Technical: "bg-accent/10 text-accent-dark",
  Safety: "bg-status-error/10 text-status-error",
  Regulatory: "bg-sector-policy/10 text-sector-policy",
  Digital: "bg-sector-survey-design/10 text-sector-survey-design",
  Management: "bg-sector-project-management/10 text-sector-project-management",
};

const escoTypeLabels: Record<string, string> = {
  "skill/competence": "Skill / Competence",
  knowledge: "Knowledge",
};

interface SkillBadgeProps {
  skill: Skill;
  className?: string;
}

export function SkillBadge({ skill, className }: SkillBadgeProps) {
  const hasEsco = !!skill.escoUri;

  return (
    <span
      className={cn(
        "group relative inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        categoryStyles[skill.category] ?? "bg-gray-100 text-text-secondary",
        className,
      )}
    >
      {skill.name}
      {skill.isTransferable && (
        <svg
          className="h-3 w-3 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-label="Transferable skill"
        >
          <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )}

      {hasEsco && (
        <span
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
            "hidden w-max max-w-52 rounded-lg bg-primary px-3 py-2 text-[11px] leading-tight text-text-inverse shadow-lg",
            "group-hover:block",
          )}
          role="tooltip"
        >
          <span className="block font-semibold">ESCO Classification</span>
          {skill.escoLevel && (
            <span className="block mt-0.5">
              Level {skill.escoLevel} &mdash;{" "}
              {escoTypeLabels[skill.escoType ?? ""] ?? skill.escoType}
            </span>
          )}
          {skill.isTransferable && (
            <span className="mt-1 block text-secondary-light">Transferable across sectors</span>
          )}
          <span
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-primary"
            aria-hidden
          />
        </span>
      )}
    </span>
  );
}
