"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CareerCard } from "./CareerCard";
import type { Career } from "@/lib/types";

const sectorColours: Record<string, string> = {
  "Operations & Maintenance": "#0C2340",
  "Marine Operations": "#1E6091",
  Electrical: "#F59E0B",
  "Survey & Design": "#7C3AED",
  "Health, Safety & Environment": "#DC2626",
  "Policy & Regulation": "#059669",
  "Project Management": "#EA580C",
};

export function CareerFilters({ careers }: { careers: Career[] }) {
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set());

  const sectors = useMemo(() => Array.from(new Set(careers.map((c) => c.sector))), [careers]);

  const toggleSector = (sector: string) => {
    setActiveSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  };

  const filtered = useMemo(
    () => (activeSectors.size === 0 ? careers : careers.filter((c) => activeSectors.has(c.sector))),
    [careers, activeSectors],
  );

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">All Careers</h2>
          <p className="text-sm text-text-secondary mt-1">
            {filtered.length} of {careers.length} careers
          </p>
        </div>
      </div>

      {/* Sector filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveSectors(new Set())}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
            activeSectors.size === 0
              ? "bg-primary text-white border-primary"
              : "bg-white text-text-secondary border-gray-200 hover:border-primary",
          )}
        >
          All Sectors
        </button>
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => toggleSector(sector)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
              activeSectors.has(sector)
                ? "text-white border-transparent"
                : "bg-white text-text-secondary border-gray-200 hover:border-gray-400",
            )}
            style={
              activeSectors.has(sector)
                ? {
                    backgroundColor: sectorColours[sector],
                    borderColor: sectorColours[sector],
                  }
                : undefined
            }
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Career grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((career) => (
          <CareerCard key={career.slug} career={career} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary">No careers match the selected filters.</p>
        </div>
      )}
    </div>
  );
}
