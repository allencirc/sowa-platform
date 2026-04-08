"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DATE_PRESETS } from "@/lib/report-templates";

interface DateRangePickerProps {
  onChange: (range: { from: string; to: string; days?: number }) => void;
  defaultDays?: number;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DateRangePicker({ onChange, defaultDays = 28 }: DateRangePickerProps) {
  const defaultPreset = DATE_PRESETS.find((p) => p.value === String(defaultDays))?.value ?? "30";
  const [preset, setPreset] = useState<string>(defaultPreset);
  const [customFrom, setCustomFrom] = useState(daysAgo(30));
  const [customTo, setCustomTo] = useState(today());

  const handlePresetChange = useCallback(
    (value: string) => {
      setPreset(value);
      if (value !== "custom") {
        const days = Number(value);
        onChange({ from: daysAgo(days), to: today(), days });
      } else {
        onChange({ from: customFrom, to: customTo });
      }
    },
    [onChange, customFrom, customTo],
  );

  const handleCustomChange = useCallback(
    (from: string, to: string) => {
      setCustomFrom(from);
      setCustomTo(to);
      onChange({ from, to });
    },
    [onChange],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-text-secondary">Date Range</label>
        <Select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          options={DATE_PRESETS.map((p) => ({
            label: p.label,
            value: p.value,
          }))}
        />
      </div>

      {preset === "custom" && (
        <>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-text-secondary">From</label>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => handleCustomChange(e.target.value, customTo)}
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-text-secondary">To</label>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => handleCustomChange(customFrom, e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
