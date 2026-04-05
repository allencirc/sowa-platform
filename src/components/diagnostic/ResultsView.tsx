"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Trophy,
  TrendingDown,
  Check,
  Copy,
  Mail,
  Target,
  BarChart3,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ResultsChart } from "@/components/diagnostic/ResultsChart";
import { GapCard } from "@/components/diagnostic/GapCard";
import { RecommendationCards } from "@/components/diagnostic/RecommendationCards";
import { RoleFitView } from "@/components/diagnostic/RoleFitView";
import { AISummary } from "@/components/diagnostic/AISummary";
import { buildShareUrl, type ResultsTab } from "@/lib/diagnostic-share";
import type { DiagnosticResult, Skill } from "@/lib/types";

interface ResultsViewProps {
  result: DiagnosticResult;
  answers: Record<string, string | string[]>;
  allSkills: Skill[];
  initialTab?: ResultsTab;
  localePrefix?: string;
  /** Called when the user switches tabs — parent can sync the URL. */
  onTabChange?: (tab: ResultsTab) => void;
}

export function ResultsView({
  result,
  answers,
  allSkills,
  initialTab = "gaps",
  localePrefix = "",
  onTabChange,
}: ResultsViewProps) {
  const [tab, setTab] = useState<ResultsTab>(initialTab);
  const [copied, setCopied] = useState(false);

  // Sync tab state when initialTab changes (e.g. hydration from URL).
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const overallPct = useMemo(() => {
    let totalScore = 0;
    let totalMax = 0;
    for (const [slug, score] of Object.entries(result.scores)) {
      const max = result.maxPossible[slug] ?? 0;
      if (max > 0) {
        totalScore += score;
        totalMax += max;
      }
    }
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  }, [result]);

  const topGaps = result.gaps.slice(0, 3);

  const handleTabChange = useCallback(
    (next: ResultsTab) => {
      setTab(next);
      onTabChange?.(next);
    },
    [onTabChange]
  );

  const handleCopyLink = useCallback(async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = buildShareUrl(origin, localePrefix, answers, tab);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else if (typeof window !== "undefined") {
        // Legacy fallback
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Silently ignore; the mailto fallback still works.
    }
  }, [answers, localePrefix, tab]);

  const mailtoHref = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const url = buildShareUrl(window.location.origin, localePrefix, answers, tab);
    const subject = encodeURIComponent("My SOWA offshore wind skills profile");
    const body = encodeURIComponent(
      `Hi,\n\nI just completed the SOWA offshore wind skills assessment. Here's my profile — I'd love your thoughts:\n\n${url}\n\nThanks`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }, [answers, localePrefix, tab]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary-light py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-6">
              <Trophy className="h-10 w-10 text-secondary-dark" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Your OWE Skills Profile
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Here&apos;s your personalised skills assessment and recommendations
            </p>

            <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-10 py-8">
              <div className="relative w-32 h-32 mb-3">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 128 128"
                  role="img"
                  aria-label={`Overall score ${overallPct} percent`}
                >
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#00A878"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallPct / 100) * 352} 352`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white"
                  aria-hidden="true"
                >
                  {overallPct}%
                </span>
              </div>
              <span className="text-sm font-medium text-white/70">
                Overall Score
              </span>
            </div>

            {/* Share actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                aria-live="polite"
                data-testid="copy-share-link"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Link copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy share link
                  </>
                )}
              </Button>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Share with your mentor
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Tab control */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <Container>
          <div
            role="tablist"
            aria-label="Results view"
            className="flex items-center justify-center gap-1 py-3"
          >
            <TabButton
              active={tab === "gaps"}
              onClick={() => handleTabChange("gaps")}
              id="tab-gaps"
              controls="panel-gaps"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Your gaps
            </TabButton>
            <TabButton
              active={tab === "roles"}
              onClick={() => handleTabChange("roles")}
              id="tab-roles"
              controls="panel-roles"
            >
              <Target className="h-4 w-4" aria-hidden="true" />
              Best-fit roles
            </TabButton>
          </div>
        </Container>
      </section>

      {/* GAP-FIRST VIEW */}
      {tab === "gaps" && (
        <div
          role="tabpanel"
          id="panel-gaps"
          aria-labelledby="tab-gaps"
          tabIndex={0}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <section className="py-12 sm:py-16 bg-white">
            <Container>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                  Skills Breakdown
                </h2>
                <p className="text-text-secondary text-center mb-8">
                  Your scores across skill categories compared to the industry
                  benchmark
                </p>
                <div className="bg-surface rounded-2xl p-6 sm:p-8">
                  <ResultsChart result={result} allSkills={allSkills} />
                </div>
              </div>
            </Container>
          </section>

          {topGaps.length > 0 && (
            <section className="py-12 sm:py-16 bg-surface">
              <Container>
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-error/10">
                      <TrendingDown
                        className="h-5 w-5 text-status-error"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        Top Skill Gaps
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Areas where targeted training would have the most impact
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {topGaps.map((gap, i) => (
                      <GapCard key={gap.skill.slug} gap={gap} rank={i + 1} />
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          )}

          <section className="py-12 sm:py-16 bg-white">
            <Container>
              <RecommendationCards result={result} />
            </Container>
          </section>

          <AISummary
            result={result}
            answers={answers}
            overallScorePercent={overallPct}
          />
        </div>
      )}

      {/* ROLE-FIRST VIEW */}
      {tab === "roles" && (
        <div
          role="tabpanel"
          id="panel-roles"
          aria-labelledby="tab-roles"
          tabIndex={0}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <section className="py-12 sm:py-16 bg-surface">
            <Container>
              <div className="max-w-3xl mx-auto">
                <RoleFitView result={result} />
              </div>
            </Container>
          </section>
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  id,
  controls,
  children,
}: {
  active: boolean;
  onClick: () => void;
  id: string;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
        (active
          ? "bg-primary text-white shadow-sm"
          : "bg-gray-50 text-text-secondary hover:bg-gray-100")
      }
    >
      {children}
    </button>
  );
}
