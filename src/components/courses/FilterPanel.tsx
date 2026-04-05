"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface FilterPanelProps {
  courses: Course[];
  className?: string;
}

export function FilterPanel({ courses, className }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract current filter state from URL
  const activeFormats = searchParams.getAll("format");
  const activeProviders = searchParams.getAll("provider");
  const activeTags = searchParams.getAll("tag");
  const freeOnly = searchParams.get("free") === "true";
  const startingSoon = searchParams.get("startingSoon") === "true";

  // Derive unique values from course data
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    courses.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [courses]);

  const allProviders = useMemo(() => {
    const providerSet = new Set<string>();
    courses.forEach((c) => providerSet.add(c.provider));
    return Array.from(providerSet).sort();
  }, [courses]);

  const allFormats: Course["deliveryFormat"][] = [
    "In-Person",
    "Online",
    "Blended",
    "Self-Paced",
  ];

  const updateParams = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.append(key, value);
      } else {
        const all = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        all.forEach((v) => params.append(key, v));
      }
      router.push(`/training?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleBool = useCallback(
    (key: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.set(key, "true");
      } else {
        params.delete(key);
      }
      router.push(`/training?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/training", { scroll: false });
  }, [router]);

  const hasAnyFilters =
    activeFormats.length > 0 ||
    activeProviders.length > 0 ||
    activeTags.length > 0 ||
    freeOnly ||
    startingSoon;

  return (
    <aside className={cn("space-y-6", className)} aria-label="Course filters">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Filters</h2>
        {hasAnyFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-dark hover:text-accent-dark transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Topic / Tags */}
      <FilterSection title="Topic">
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {allTags.map((tag) => (
            <Checkbox
              key={tag}
              id={`tag-${tag}`}
              label={tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " ")}
              checked={activeTags.includes(tag)}
              onChange={(checked) => updateParams("tag", tag, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Delivery Format */}
      <FilterSection title="Delivery Format">
        <div className="space-y-2.5">
          {allFormats.map((format) => (
            <Checkbox
              key={format}
              id={`format-${format}`}
              label={format}
              checked={activeFormats.includes(format)}
              onChange={(checked) => updateParams("format", format, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Cost */}
      <FilterSection title="Cost">
        <div className="space-y-3">
          <Checkbox
            id="free-only"
            label="Free courses only"
            checked={freeOnly}
            onChange={(checked) => toggleBool("free", checked)}
          />
          {!freeOnly && (
            <p className="text-xs text-text-muted">
              Courses range from Free to{" "}
              {new Intl.NumberFormat("en-IE", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(Math.max(...courses.map((c) => c.cost)))}
            </p>
          )}
        </div>
      </FilterSection>

      {/* Provider */}
      <FilterSection title="Provider">
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {allProviders.map((provider) => (
            <Checkbox
              key={provider}
              id={`provider-${provider}`}
              label={provider}
              checked={activeProviders.includes(provider)}
              onChange={(checked) => updateParams("provider", provider, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Starting Soon */}
      <FilterSection title="Availability">
        <Checkbox
          id="starting-soon"
          label="Starting within 30 days"
          checked={startingSoon}
          onChange={(checked) => toggleBool("startingSoon", checked)}
        />
      </FilterSection>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-100 pt-5">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}
