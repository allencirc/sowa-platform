"use client";

import Link from "next/link";
import { ArrowRight, Check, Target } from "lucide-react";
import type { DiagnosticResult } from "@/lib/types";

interface RoleFitViewProps {
  result: DiagnosticResult;
}

/**
 * Role-first secondary view — complements the gap-first view.
 * Shows top-3 role families ranked by confidence with deterministic
 * reasoning bullets and career deep-links.
 */
export function RoleFitView({ result }: RoleFitViewProps) {
  const top = result.roleFamilyFit.slice(0, 3);

  if (top.length === 0) {
    return <p className="text-center text-text-secondary">No role fit data available yet.</p>;
  }

  return (
    <div className="space-y-6" aria-label="Best-fit role families">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
          <Target className="h-5 w-5 text-accent-dark" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Your best-fit role families</h2>
          <p className="text-sm text-text-secondary">
            Where your current strengths place you in the offshore wind workforce
          </p>
        </div>
      </div>

      <ol className="space-y-5 list-none p-0">
        {top.map((fit, index) => (
          <li
            key={fit.family}
            className="bg-white border-2 border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent-dark text-sm font-bold"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">{fit.label}</h3>
                </div>
                <p className="text-sm text-text-secondary">{fit.tagline}</p>
              </div>
              <div
                className="text-right flex-shrink-0"
                role="img"
                aria-label={`Confidence score ${fit.confidence} out of 100`}
              >
                <div className="text-3xl font-bold text-accent-dark leading-none">
                  {fit.confidence}
                  <span className="text-base font-medium text-text-muted">/100</span>
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mt-1">
                  Confidence
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div
              className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5"
              role="progressbar"
              aria-valuenow={fit.confidence}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${fit.label} confidence`}
            >
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700 ease-out"
                style={{ width: `${fit.confidence}%` }}
              />
            </div>

            {/* Reasoning */}
            {fit.reasoning.length > 0 && (
              <ul className="space-y-2 mb-5">
                {fit.reasoning.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check
                      className="h-4 w-4 text-secondary-dark flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Careers in this family */}
            {fit.careerSlugs.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
                  Careers in this family
                </p>
                <ul className="flex flex-wrap gap-2">
                  {fit.careerSlugs.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/careers/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:text-accent bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        {formatCareerSlug(slug)}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatCareerSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
