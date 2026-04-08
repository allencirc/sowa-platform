"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ReportId } from "@/lib/report-templates";

interface ExportButtonProps {
  report: ReportId;
  from: string;
  to: string;
}

export function ExportButton({ report, from, to }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function exportAs(format: "csv" | "pdf") {
    const params = new URLSearchParams({
      format,
      report,
      from,
      to,
    });
    window.location.href = `/api/admin/analytics/export?${params}`;
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5">
        <Download className="h-4 w-4" />
        Export Report
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface"
            onClick={() => exportAs("csv")}
          >
            Export as CSV
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface"
            onClick={() => exportAs("pdf")}
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
