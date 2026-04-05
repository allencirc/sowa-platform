"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ResultsView } from "@/components/diagnostic/ResultsView";
import { calculateResults } from "@/lib/diagnostic";
import {
  decodeAnswers,
  isResultsTab,
  type AnswerSet,
  type ResultsTab,
} from "@/lib/diagnostic-share";
import type {
  Career,
  Course,
  DiagnosticQuestion,
  DiagnosticResult,
  Skill,
} from "@/lib/types";

interface ResultsClientProps {
  questions: DiagnosticQuestion[];
  allSkills: Skill[];
  allCareers: Career[];
  allCourses: Course[];
}

export default function ResultsClient({
  questions,
  allSkills,
  allCareers,
  allCourses,
}: ResultsClientProps) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "";

  // We read the share payload directly from window.location instead of
  // useSearchParams() to avoid Next.js 16's client-side-rendering
  // bailout. The params are only meaningful on the client anyway — the
  // server renders a minimal skeleton and the client hydrates the
  // actual result from the URL.
  const [queryParams, setQueryParams] = useState<{
    rawA: string | null;
    rawTab: string | null;
  } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQueryParams({ rawA: sp.get("a"), rawTab: sp.get("tab") });
  }, []);

  const rawA = queryParams?.rawA ?? null;
  const rawTab = queryParams?.rawTab ?? null;
  const initialTab: ResultsTab = isResultsTab(rawTab) ? rawTab : "gaps";

  // Decode answers from URL param.
  const decoded = useMemo(() => decodeAnswers(rawA), [rawA]);

  const answers: AnswerSet | null = decoded.ok ? decoded.answers : null;

  const result: DiagnosticResult | null = useMemo(() => {
    if (!answers) return null;
    return calculateResults(answers, {
      questions,
      allSkills,
      allCareers,
      allCourses,
    });
  }, [answers, questions, allSkills, allCareers, allCourses]);

  const [tab, setTab] = useState<ResultsTab>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);

  const handleTabChange = useCallback((next: ResultsTab) => {
    setTab(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // no-op
    }
  }, []);

  // Before the initial client effect runs we have no query params yet.
  // Render a neutral placeholder so the server output and first client
  // render match (avoids hydration mismatch) AND the React streaming
  // runtime has something to swap the loading.tsx fallback with.
  if (queryParams === null) {
    return (
      <section
        className="py-20 sm:py-28 bg-surface min-h-[60vh]"
        aria-busy="true"
        aria-label="Loading skills profile"
      />
    );
  }

  // Incompatible version — friendly re-take CTA.
  if (!decoded.ok && decoded.reason === "incompatible_version") {
    return (
      <EmptyState
        title="This link is from an older assessment"
        body="We've updated the diagnostic since this profile was shared, so the scores wouldn't line up. Take a fresh assessment to see your current fit."
        locale={locale}
      />
    );
  }

  // Missing / malformed param — prompt the user to take the assessment.
  if (!decoded.ok || !result) {
    return (
      <EmptyState
        title="No skills profile to display"
        body="This page shows a shared skills profile. Take the assessment to generate your own — it only takes about 5 minutes."
        locale={locale}
      />
    );
  }

  return (
    <ResultsView
      result={result}
      answers={answers!}
      allSkills={allSkills}
      initialTab={tab}
      localePrefix={locale}
      onTabChange={handleTabChange}
    />
  );
}

function EmptyState({
  title,
  body,
  locale,
}: {
  title: string;
  body: string;
  locale: string;
}) {
  const href = locale
    ? `/${locale}/diagnostic/assessment`
    : "/diagnostic/assessment";
  return (
    <section className="py-20 sm:py-28 bg-surface min-h-[60vh]">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-5">
            <AlertCircle className="h-7 w-7 text-accent-dark" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            {title}
          </h1>
          <p className="text-text-secondary mb-8">{body}</p>
          <Link href={href}>
            <Button variant="primary" size="lg">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Take the assessment
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
