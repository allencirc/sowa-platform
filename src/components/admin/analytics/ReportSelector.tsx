"use client";

import { Button } from "@/components/ui/Button";
import { REPORT_TEMPLATES, type ReportId } from "@/lib/report-templates";

interface ReportSelectorProps {
  active: ReportId;
  onChange: (id: ReportId) => void;
}

const TABS: { id: ReportId; label: string }[] = Object.values(REPORT_TEMPLATES).map((t) => ({
  id: t.id,
  label: t.label,
}));

export function ReportSelector({ active, onChange }: ReportSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          variant={active === tab.id ? "primary" : "ghost"}
          size="sm"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
