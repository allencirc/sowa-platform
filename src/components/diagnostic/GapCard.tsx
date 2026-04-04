import { cn } from "@/lib/utils";
import type { DiagnosticGap } from "@/lib/types";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

const severityConfig = {
  high: {
    icon: AlertTriangle,
    label: "High Gap",
    colour: "text-status-error",
    bg: "bg-status-error/10",
    barColour: "bg-status-error",
    border: "border-status-error/20",
  },
  medium: {
    icon: AlertCircle,
    label: "Medium Gap",
    colour: "text-status-warning",
    bg: "bg-status-warning/10",
    barColour: "bg-status-warning",
    border: "border-status-warning/20",
  },
  low: {
    icon: CheckCircle,
    label: "Low Gap",
    colour: "text-secondary",
    bg: "bg-secondary/10",
    barColour: "bg-secondary",
    border: "border-secondary/20",
  },
};

interface GapCardProps {
  gap: DiagnosticGap;
  rank: number;
}

export function GapCard({ gap, rank }: GapCardProps) {
  const pct = Math.round((gap.score / gap.maxScore) * 100);
  const config = severityConfig[gap.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-5 sm:p-6 transition-all duration-200 hover:shadow-md",
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-muted/40">
            #{rank}
          </span>
          <div>
            <h4 className="font-bold text-text-primary text-base">
              {gap.skill.name}
            </h4>
            <span className="text-xs text-text-muted">{gap.skill.category}</span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full",
            config.bg,
            config.colour
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Your score</span>
          <span className="font-semibold text-text-primary">
            {pct}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              config.barColour
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>
            {gap.score} / {gap.maxScore} points
          </span>
          <span className="text-text-muted/60">Target: 65%</span>
        </div>
      </div>
    </div>
  );
}
