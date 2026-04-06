"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/courses/FilterPanel";
import { FilterDrawer } from "@/components/courses/FilterDrawer";
import { FilterChips } from "@/components/courses/FilterChips";
import { CourseCard } from "@/components/courses/CourseCard";
import { Select } from "@/components/ui/Select";
import type { Course } from "@/lib/types";

interface CourseListingClientProps {
  courses: Course[];
}

const sortOptions = [
  { label: "Start Date", value: "startDate" },
  { label: "Title A–Z", value: "titleAZ" },
  { label: "Cost: Low → High", value: "costLow" },
];

export function CourseListingClient({ courses }: CourseListingClientProps) {
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "startDate";
  const activeFormats = searchParams.getAll("format");
  const activeProviders = searchParams.getAll("provider");
  const activeTags = searchParams.getAll("tag");
  const freeOnly = searchParams.get("free") === "true";
  const startingSoon = searchParams.get("startingSoon") === "true";

  const activeFilterCount =
    activeFormats.length +
    activeProviders.length +
    activeTags.length +
    (freeOnly ? 1 : 0) +
    (startingSoon ? 1 : 0);

  // Filter courses based on URL params
  const filtered = useMemo(() => {
    let result = [...courses];

    // Format filter
    if (activeFormats.length > 0) {
      result = result.filter((c) => activeFormats.includes(c.deliveryFormat));
    }

    // Provider filter
    if (activeProviders.length > 0) {
      result = result.filter((c) => activeProviders.includes(c.provider));
    }

    // Tag filter
    if (activeTags.length > 0) {
      result = result.filter((c) => activeTags.some((tag) => c.tags.includes(tag)));
    }

    // Free only
    if (freeOnly) {
      result = result.filter((c) => c.cost === 0);
    }

    // Starting soon (within 30 days)
    if (startingSoon) {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      result = result.filter((c) => {
        if (!c.nextStartDate) return false;
        const start = new Date(c.nextStartDate);
        return start >= now && start <= thirtyDays;
      });
    }

    // Sort
    switch (sort) {
      case "titleAZ":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "costLow":
        result.sort((a, b) => a.cost - b.cost);
        break;
      case "startDate":
      default:
        result.sort((a, b) => {
          if (!a.nextStartDate && !b.nextStartDate) return 0;
          if (!a.nextStartDate) return 1;
          if (!b.nextStartDate) return -1;
          return a.nextStartDate.localeCompare(b.nextStartDate);
        });
        break;
    }

    return result;
  }, [courses, activeFormats, activeProviders, activeTags, freeOnly, startingSoon, sort]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop sidebar */}
      <FilterPanel courses={courses} className="hidden lg:block w-64 shrink-0" />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <FilterDrawer courses={courses} activeFilterCount={activeFilterCount} />
            <p className="text-sm text-text-secondary" aria-live="polite">
              Showing <span className="font-semibold text-text-primary">{filtered.length}</span> of{" "}
              {courses.length} courses
            </p>
          </div>

          <SortSelect currentSort={sort} />
        </div>

        {/* Active filter chips */}
        <div className="mb-6">
          <FilterChips />
        </div>

        {/* Course grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-text-secondary mb-2">No courses match your filters</p>
            <p className="text-sm text-text-muted">
              Try adjusting or clearing your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Sort dropdown that updates URL */
function SortSelect({ currentSort }: { currentSort: string }) {
  // We use a native select that updates URL via navigation
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", e.target.value);
    window.history.pushState(null, "", `/training?${params.toString()}`);
    // Trigger re-render by dispatching popstate
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-text-secondary whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleChange}
        className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none cursor-pointer"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
