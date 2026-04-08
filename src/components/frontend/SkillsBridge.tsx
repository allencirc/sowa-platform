"use client";

import { useState, useMemo, useId } from "react";
import Link from "next/link";
import { Check, ArrowRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import type { Skill, Course } from "@/lib/types";
import {
  SOURCE_SECTORS,
  type SourceSector,
  computeSkillsBridge,
  coursesForSkill,
} from "@/lib/skills-bridge";

interface SkillsBridgeProps {
  skills: Skill[];
  courses: Course[];
}

const sectorOptions = SOURCE_SECTORS.map((s) => ({ label: s, value: s }));

export function SkillsBridge({ skills, courses }: SkillsBridgeProps) {
  const [sector, setSector] = useState<SourceSector | "">("");
  const resultsId = useId();

  const result = useMemo(
    () => (sector ? computeSkillsBridge(sector, skills) : null),
    [sector, skills],
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
        <Compass className="h-6 w-6 text-accent-dark" />
        Skills Bridge
      </h2>
      <p className="text-text-secondary mb-6 max-w-2xl">
        Already working in another industry? See which of your existing skills transfer to this role
        and what you&apos;ll need to develop.
      </p>

      <div className="max-w-xs mb-8">
        <Select
          id="skills-bridge-sector"
          label="I'm coming from..."
          placeholder="Select your industry"
          options={sectorOptions}
          value={sector}
          onChange={(e) => setSector(e.target.value as SourceSector)}
          aria-controls={resultsId}
        />
      </div>

      {/* Results region — announced to screen readers on change */}
      <div
        id={resultsId}
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "transition-opacity duration-300 motion-reduce:transition-none",
          result ? "opacity-100" : "opacity-0",
        )}
      >
        {result && (
          <>
            {/* Match percentage */}
            <div role="status" className="mb-8 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0" aria-hidden="true">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-200"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${result.matchPercentage} ${100 - result.matchPercentage}`}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-500 motion-reduce:transition-none",
                      result.matchPercentage >= 60
                        ? "text-secondary"
                        : result.matchPercentage >= 30
                          ? "text-status-warning"
                          : "text-status-error",
                    )}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
                  {result.matchPercentage}%
                </span>
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {result.matchPercentage}% Skills Match
                </p>
                <p className="text-sm text-text-secondary">
                  {result.matchedSkills.length} transferable skill
                  {result.matchedSkills.length !== 1 && "s"}, {result.gapSkills.length} to develop
                </p>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched skills */}
              <div
                className={cn(
                  "rounded-xl border border-secondary/30 bg-secondary/5 p-5",
                  "transition-all duration-300 motion-reduce:transition-none",
                )}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-dark mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Your Existing Skills
                </h3>
                {result.matchedSkills.length > 0 ? (
                  <ul className="space-y-2" aria-label="Matched skills">
                    {result.matchedSkills.map((skill) => (
                      <li key={skill.slug} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-secondary shrink-0" aria-hidden="true" />
                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary-dark">
                          {skill.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted italic">
                    No direct skill matches found for this sector.
                  </p>
                )}
              </div>

              {/* Gap skills */}
              <div
                className={cn(
                  "rounded-xl border border-status-warning/30 bg-status-warning/5 p-5",
                  "transition-all duration-300 motion-reduce:transition-none",
                )}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-status-warning mb-4 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Skills to Develop
                </h3>
                {result.gapSkills.length > 0 ? (
                  <ul className="space-y-4" aria-label="Gap skills to develop">
                    {result.gapSkills.map((skill) => {
                      const matchingCourses = coursesForSkill(skill, courses);
                      return (
                        <li key={skill.slug}>
                          <div className="flex items-center gap-2 mb-1">
                            <ArrowRight
                              className="h-4 w-4 text-status-warning shrink-0"
                              aria-hidden="true"
                            />
                            <span className="inline-flex items-center rounded-full bg-status-warning/10 px-3 py-1 text-xs font-medium text-amber-800">
                              {skill.name}
                            </span>
                          </div>
                          {matchingCourses.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {matchingCourses.map((course) => (
                                <Link
                                  key={course.slug}
                                  href={`/training/${course.slug}`}
                                  className="flex items-center gap-1.5 text-xs text-accent-dark hover:text-accent hover:underline transition-colors"
                                >
                                  <ArrowRight className="h-3 w-3 shrink-0" />
                                  {course.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted italic">
                    Great news — your skills fully cover this role!
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
