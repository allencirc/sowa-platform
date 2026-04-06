"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface FilterDrawerProps {
  courses: Course[];
  activeFilterCount: number;
}

export function FilterDrawer({ courses, activeFilterCount }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local draft state — only applied on "Apply"
  const [draftParams, setDraftParams] = useState(new URLSearchParams(searchParams.toString()));

  // Sync draft when URL changes externally
  useEffect(() => {
    setDraftParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

  const allFormats: Course["deliveryFormat"][] = ["In-Person", "Online", "Blended", "Self-Paced"];

  const toggleDraftArray = (key: string, value: string, checked: boolean) => {
    const next = new URLSearchParams(draftParams.toString());
    if (checked) {
      next.append(key, value);
    } else {
      const remaining = next.getAll(key).filter((v) => v !== value);
      next.delete(key);
      remaining.forEach((v) => next.append(key, v));
    }
    setDraftParams(next);
  };

  const toggleDraftBool = (key: string, checked: boolean) => {
    const next = new URLSearchParams(draftParams.toString());
    if (checked) {
      next.set(key, "true");
    } else {
      next.delete(key);
    }
    setDraftParams(next);
  };

  const applyFilters = () => {
    router.push(`/training?${draftParams.toString()}`, { scroll: false });
    setOpen(false);
  };

  const clearAll = () => {
    setDraftParams(new URLSearchParams());
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50 cursor-pointer",
          activeFilterCount > 0 && "border-secondary text-secondary-dark",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-secondary text-primary text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-text-primary">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="text-xs font-medium text-accent-dark hover:text-accent-dark cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Topics */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Topic</h3>
            <div className="space-y-2.5">
              {allTags.map((tag) => (
                <Checkbox
                  key={tag}
                  id={`d-tag-${tag}`}
                  label={tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " ")}
                  checked={draftParams.getAll("tag").includes(tag)}
                  onChange={(checked) => toggleDraftArray("tag", tag, checked)}
                />
              ))}
            </div>
          </div>

          {/* Delivery Format */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Delivery Format</h3>
            <div className="space-y-2.5">
              {allFormats.map((format) => (
                <Checkbox
                  key={format}
                  id={`d-format-${format}`}
                  label={format}
                  checked={draftParams.getAll("format").includes(format)}
                  onChange={(checked) => toggleDraftArray("format", format, checked)}
                />
              ))}
            </div>
          </div>

          {/* Cost */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Cost</h3>
            <Checkbox
              id="d-free-only"
              label="Free courses only"
              checked={draftParams.get("free") === "true"}
              onChange={(checked) => toggleDraftBool("free", checked)}
            />
          </div>

          {/* Provider */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Provider</h3>
            <div className="space-y-2.5">
              {allProviders.map((provider) => (
                <Checkbox
                  key={provider}
                  id={`d-provider-${provider}`}
                  label={provider}
                  checked={draftParams.getAll("provider").includes(provider)}
                  onChange={(checked) => toggleDraftArray("provider", provider, checked)}
                />
              ))}
            </div>
          </div>

          {/* Starting Soon */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Availability</h3>
            <Checkbox
              id="d-starting-soon"
              label="Starting within 30 days"
              checked={draftParams.get("startingSoon") === "true"}
              onChange={(checked) => toggleDraftBool("startingSoon", checked)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}
