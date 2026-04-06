import Link from "next/link";
import { ArrowDown, ArrowRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Career } from "@/lib/types";
import { getAllCareers } from "@/lib/queries";

interface MiniPathwayProps {
  career: Career;
}

const sectorColours: Record<string, string> = {
  "Operations & Maintenance": "border-sector-operations",
  "Marine Operations": "border-sector-marine",
  Electrical: "border-sector-electrical",
  "Survey & Design": "border-sector-survey-design",
  "Health, Safety & Environment": "border-sector-hse",
  "Policy & Regulation": "border-sector-policy",
  "Project Management": "border-sector-project-management",
};

export async function MiniPathway({ career }: MiniPathwayProps) {
  const allCareers = await getAllCareers();

  // Find who leads TO this career
  const incomingConnections = allCareers
    .filter((c) => c.pathwayConnections.some((p) => p.to === career.slug))
    .map((c) => ({
      career: c,
      connection: c.pathwayConnections.find((p) => p.to === career.slug)!,
    }));

  // Outgoing from this career
  const outgoingConnections = career.pathwayConnections
    .map((conn) => ({
      career: allCareers.find((c) => c.slug === conn.to),
      connection: conn,
    }))
    .filter(
      (c): c is { career: Career; connection: typeof c.connection } => c.career !== undefined,
    );

  if (incomingConnections.length === 0 && outgoingConnections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* How to get here */}
      {incomingConnections.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            How to Get Here
          </h4>
          <div className="space-y-3">
            {incomingConnections.map(({ career: from, connection }) => (
              <div key={from.slug} className="flex items-center gap-3">
                <Link
                  href={`/careers/${from.slug}`}
                  className={cn(
                    "flex-1 block p-3 rounded-lg border-l-4 bg-surface-card border border-gray-100 hover:shadow-md transition-shadow",
                    sectorColours[from.sector] ?? "border-gray-300",
                  )}
                >
                  <div className="text-sm font-semibold text-text-primary">{from.title}</div>
                  <div className="text-xs text-text-muted">{from.sector}</div>
                </Link>
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <MoveRight className="h-5 w-5 text-secondary-dark" />
                  <span className="text-[10px] text-text-muted whitespace-nowrap">
                    {connection.timeframe}
                  </span>
                  <Badge variant={connection.type === "progression" ? "secondary" : "default"}>
                    {connection.type}
                  </Badge>
                </div>
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current role indicator */}
      <div className="flex justify-center">
        <div
          className={cn(
            "px-5 py-3 rounded-xl border-2 bg-surface-card shadow-sm text-center",
            sectorColours[career.sector] ?? "border-gray-300",
          )}
        >
          <div className="text-base font-bold text-text-primary">{career.title}</div>
          <div className="text-xs text-text-muted">
            {career.entryLevel} &middot; {career.sector}
          </div>
        </div>
      </div>

      {/* Where this leads */}
      {outgoingConnections.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Where This Leads
          </h4>
          <div className="space-y-3">
            {outgoingConnections.map(({ career: to, connection }) => (
              <div key={to.slug} className="flex items-center gap-3">
                <div className="flex-1" />
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <ArrowDown className="h-5 w-5 text-secondary-dark" />
                  <span className="text-[10px] text-text-muted whitespace-nowrap">
                    {connection.timeframe}
                  </span>
                  <Badge variant={connection.type === "progression" ? "secondary" : "default"}>
                    {connection.type}
                  </Badge>
                </div>
                <Link
                  href={`/careers/${to.slug}`}
                  className={cn(
                    "flex-1 block p-3 rounded-lg border-l-4 bg-surface-card border border-gray-100 hover:shadow-md transition-shadow",
                    sectorColours[to.sector] ?? "border-gray-300",
                  )}
                >
                  <div className="text-sm font-semibold text-text-primary">{to.title}</div>
                  <div className="text-xs text-text-muted">{to.sector}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
