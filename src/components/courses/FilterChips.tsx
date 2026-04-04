"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface FilterChip {
  key: string;
  value: string;
  label: string;
}

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips: FilterChip[] = [];

  searchParams.getAll("format").forEach((v) =>
    chips.push({ key: "format", value: v, label: v })
  );
  searchParams.getAll("tag").forEach((v) =>
    chips.push({
      key: "tag",
      value: v,
      label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " "),
    })
  );
  searchParams.getAll("provider").forEach((v) =>
    chips.push({ key: "provider", value: v, label: v })
  );
  if (searchParams.get("free") === "true") {
    chips.push({ key: "free", value: "true", label: "Free Only" });
  }
  if (searchParams.get("startingSoon") === "true") {
    chips.push({
      key: "startingSoon",
      value: "true",
      label: "Starting Soon",
    });
  }

  const removeChip = useCallback(
    (chip: FilterChip) => {
      const params = new URLSearchParams(searchParams.toString());
      if (chip.key === "free" || chip.key === "startingSoon") {
        params.delete(chip.key);
      } else {
        const remaining = params.getAll(chip.key).filter((v) => v !== chip.value);
        params.delete(chip.key);
        remaining.forEach((v) => params.append(chip.key, v));
      }
      router.push(`/training?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/training", { scroll: false });
  }, [router]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <button
          key={`${chip.key}-${chip.value}-${i}`}
          onClick={() => removeChip(chip)}
          className="inline-flex items-center gap-1.5 bg-primary/5 text-primary text-sm px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
