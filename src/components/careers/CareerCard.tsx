import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Badge, SectorBadge } from "@/components/ui/Badge";
import type { Career } from "@/lib/types";

const sectorColorMap: Record<string, string> = {
  "Operations & Maintenance": "bg-sector-operations",
  "Marine Operations": "bg-sector-marine",
  Electrical: "bg-sector-electrical",
  "Survey & Design": "bg-sector-survey-design",
  "Health, Safety & Environment": "bg-sector-hse",
  "Policy & Regulation": "bg-sector-policy",
  "Project Management": "bg-sector-project-management",
};

interface CareerCardProps {
  career: Career;
  className?: string;
}

export function CareerCard({ career, className }: CareerCardProps) {
  return (
    <Link
      href={`/careers/${career.slug}`}
      className={cn(
        "group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Sector colour bar */}
      <div
        className={cn(
          "h-1.5",
          sectorColorMap[career.sector] ?? "bg-gray-300"
        )}
      />

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <SectorBadge sector={career.sector} />
          <Badge variant="default">{career.entryLevel}</Badge>
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
          {career.title}
        </h3>

        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
          {career.description}
        </p>

        {career.salaryRange && (
          <p className="text-sm font-medium text-text-primary mb-4">
            {formatCurrency(career.salaryRange.min)} –{" "}
            {formatCurrency(career.salaryRange.max)}
          </p>
        )}

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:text-accent-dark transition-colors">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
