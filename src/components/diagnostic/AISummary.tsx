"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DiagnosticResult } from "@/lib/types";

interface AISummaryProps {
  result: DiagnosticResult;
  answers: Record<string, string | string[]>;
  overallScorePercent: number;
}

const MAX_REQUESTS_PER_SESSION = 3;
const SESSION_KEY = "sowa_ai_summary";
const SESSION_COUNT_KEY = "sowa_ai_summary_count";

interface SummaryRequestBody {
  background: {
    currentSituation?: string;
    experienceLevel?: string;
    interestArea?: string;
  };
  gaps: Array<{
    skillName: string;
    severity: "high" | "medium" | "low";
    scorePercent: number;
  }>;
  recommendedCareers: Array<{
    title: string;
    sector: string;
    entryLevel: string;
  }>;
  recommendedCourses: Array<{
    title: string;
    provider: string;
    duration: string;
    cost: number;
  }>;
  overallScorePercent: number;
}

// Map answer values to human-readable labels for the LLM
const situationLabels: Record<string, string> = {
  new_entrant: "Student or considering a career change",
  adjacent: "Working in a related industry",
  current_owe: "Already working in offshore wind",
  employer: "Employer looking to develop workforce",
  educator: "Training provider or educator",
};

const qualificationLabels: Record<string, string> = {
  none: "No formal technical qualification",
  trade: "Apprenticeship or trade qualification",
  "level6-7": "Level 6-7 Certificate/Ordinary Degree",
  level8: "Level 8 Honours Degree",
  postgrad: "Level 9-10 Masters/PhD",
};

const interestLabels: Record<string, string> = {
  technical: "Hands-on technical work",
  engineering: "Engineering and design",
  marine: "Marine and logistics operations",
  hse: "Health, safety & environment",
  digital: "Data and digital",
  management: "Project/commercial management",
  policy: "Policy and regulation",
  unsure: "Not sure yet",
};

function buildRequestBody(
  result: DiagnosticResult,
  answers: Record<string, string | string[]>,
  overallScorePercent: number,
): SummaryRequestBody {
  const q1 = typeof answers.q1 === "string" ? answers.q1 : undefined;
  const q4 = typeof answers.q4 === "string" ? answers.q4 : undefined;
  const q8 = typeof answers.q8 === "string" ? answers.q8 : undefined;

  return {
    background: {
      currentSituation: q1 ? (situationLabels[q1] ?? q1) : undefined,
      experienceLevel: q4 ? (qualificationLabels[q4] ?? q4) : undefined,
      interestArea: q8 ? (interestLabels[q8] ?? q8) : undefined,
    },
    gaps: result.gaps.slice(0, 3).map((g) => ({
      skillName: g.skill.name,
      severity: g.severity,
      scorePercent: g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0,
    })),
    recommendedCareers: result.recommendedCareers.slice(0, 3).map((c) => ({
      title: c.title,
      sector: c.sector,
      entryLevel: c.entryLevel,
    })),
    recommendedCourses: result.recommendedCourses.slice(0, 3).map((c) => ({
      title: c.title,
      provider: c.provider,
      duration: c.duration,
      cost: c.cost,
    })),
    overallScorePercent,
  };
}

export function AISummary({ result, answers, overallScorePercent }: AISummaryProps) {
  const [consent, setConsent] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Restore cached summary and request count from sessionStorage
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        setSummary(cached);
        setConsent(true);
      }
      const count = sessionStorage.getItem(SESSION_COUNT_KEY);
      if (count) {
        setRequestCount(parseInt(count, 10) || 0);
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    if (requestCount >= MAX_REQUESTS_PER_SESSION) return;

    setLoading(true);
    setError(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const body = buildRequestBody(result, answers, overallScorePercent);
      const response = await fetch("/api/diagnostic/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.summary as string;

      setSummary(text);
      const newCount = requestCount + 1;
      setRequestCount(newCount);

      // Cache in session
      try {
        sessionStorage.setItem(SESSION_KEY, text);
        sessionStorage.setItem(SESSION_COUNT_KEY, String(newCount));
      } catch {
        // sessionStorage not available
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [result, answers, overallScorePercent, requestCount]);

  const handleOptIn = useCallback(() => {
    setConsent(true);
    fetchSummary();
  }, [fetchSummary]);

  const handleRegenerate = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  // If API fails and no cached summary, hide the section entirely
  if (error && !summary) {
    return null;
  }

  // Consent prompt
  if (!consent && !summary) {
    return (
      <section className="py-12 sm:py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Sparkles className="h-6 w-6 text-accent-dark" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">AI Career Guidance</h3>
            <p className="text-text-secondary mb-4 max-w-md mx-auto">
              Generate a personalised career summary using AI? Your assessment data will be
              processed securely and not stored.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>
                No personal information is shared — only your assessment answers and results
              </span>
            </div>
            <Button variant="primary" onClick={handleOptIn}>
              <Sparkles className="h-4 w-4" />
              Generate My Summary
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading && !summary) {
    return (
      <section className="py-12 sm:py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent-dark animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">AI Career Guidance</h3>
                <p className="text-sm text-text-secondary">
                  Generating your personalised summary...
                </p>
              </div>
            </div>
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-11/12" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-10/12" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-9/12" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Summary display
  if (summary) {
    const canRegenerate = requestCount < MAX_REQUESTS_PER_SESSION;

    return (
      <section className="py-12 sm:py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                  <Sparkles className="h-5 w-5 text-accent-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">AI Career Guidance</h3>
                  <p className="text-xs text-text-muted">Personalised summary powered by AI</p>
                </div>
              </div>
              {canRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Regenerating..." : "Regenerate"}
                </Button>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-text-primary leading-relaxed">
              <p>{summary}</p>
            </div>

            {!canRegenerate && (
              <p className="text-xs text-text-muted mt-4">
                Maximum regenerations reached for this session.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
