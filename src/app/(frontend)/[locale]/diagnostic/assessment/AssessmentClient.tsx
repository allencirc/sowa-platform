"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";
import { QuestionStep } from "@/components/diagnostic/QuestionStep";
import { ResultsView } from "@/components/diagnostic/ResultsView";
import { calculateResults } from "@/lib/diagnostic";
import { encodeAnswers, type ResultsTab } from "@/lib/diagnostic-share";
import { trackDiagnosticComplete } from "@/lib/analytics";
import type {
  Career,
  Course,
  DiagnosticQuestion,
  DiagnosticResult,
  Skill,
} from "@/lib/types";

interface AssessmentClientProps {
  questions: DiagnosticQuestion[];
  allSkills: Skill[];
  allCareers: Career[];
  allCourses: Course[];
}

const AUTO_ADVANCE_STORAGE_KEY = "sowa_diagnostic_auto_advance";
const AUTO_ADVANCE_DELAY_MS = 400;

/**
 * Detect whether the user environment suggests reduced motion — in
 * that case we default auto-advance OFF so progress is fully under
 * user control (WCAG 2.2.1 Timing Adjustable). Sighted mouse/keyboard
 * users get the default-ON behaviour.
 */
function detectDefaultAutoAdvance(): boolean {
  if (typeof window === "undefined") return true;
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return false;
  return true;
}

export default function AssessmentClient({
  questions,
  allSkills,
  allCareers,
  allCourses,
}: AssessmentClientProps) {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "";
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    {}
  );
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tab, setTab] = useState<ResultsTab>("gaps");
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Hydrate auto-advance preference on mount.
  useEffect(() => {
    const stored = window.localStorage.getItem(AUTO_ADVANCE_STORAGE_KEY);
    if (stored !== null) {
      setAutoAdvance(stored === "true");
    } else {
      setAutoAdvance(detectDefaultAutoAdvance());
    }
  }, []);

  const setAutoAdvancePersisted = useCallback((next: boolean) => {
    setAutoAdvance(next);
    try {
      window.localStorage.setItem(AUTO_ADVANCE_STORAGE_KEY, String(next));
    } catch {
      // localStorage disabled — fine, the in-memory state is enough.
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const hasAnswer =
    currentAnswer !== undefined &&
    (Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : currentAnswer !== "");

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const completeAssessment = useCallback(
    (finalAnswers: Record<string, string | string[]>) => {
      setIsCalculating(true);
      setTimeout(() => {
        const res = calculateResults(finalAnswers, {
          questions,
          allSkills,
          allCareers,
          allCourses,
        });
        setResult(res);
        setIsCalculating(false);
        setShowResults(true);
        trackDiagnosticComplete({
          top_gaps: res.gaps
            .slice(0, 3)
            .map((g) => g.skill.slug)
            .join(","),
          recommended_careers_count: res.recommendedCareers.length,
          recommended_courses_count: res.recommendedCourses.length,
        });

        // Update the URL so the result is shareable and reload-safe.
        // We use history.replaceState rather than router.replace so we
        // don't trigger a full Next navigation — the in-memory result
        // is already rendered and we don't want to unmount/refetch.
        try {
          const encoded = encodeAnswers(finalAnswers);
          const localePrefix = locale ? `/${locale}` : "";
          const url = `${localePrefix}/diagnostic/assessment/results?a=${encoded}&tab=gaps`;
          window.history.replaceState({}, "", url);
        } catch {
          // URL update is a best-effort enhancement.
        }
      }, 1500);
    },
    [questions, allSkills, allCareers, allCourses, locale]
  );

  const handleNext = useCallback(() => {
    if (!hasAnswer) return;
    if (isLastQuestion) {
      completeAssessment(answers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasAnswer, isLastQuestion, answers, completeAssessment]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.push(locale ? `/${locale}/diagnostic` : "/diagnostic");
    }
  }, [currentIndex, router, locale]);

  // Keep URL in sync when the user switches tabs.
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

  // Smooth-scroll to top when results render.
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showResults]);

  // Auto-advance: only when user has opted in AND the answer is a
  // single_choice. This is the WCAG 2.2.1 fix — the user can disable
  // it entirely, and a "Next" button is always rendered when it's off.
  useEffect(() => {
    if (!autoAdvance) return;
    if (currentQuestion?.type !== "single_choice") return;
    if (!hasAnswer) return;
    if (isLastQuestion) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [
    autoAdvance,
    currentAnswer,
    currentQuestion?.type,
    hasAnswer,
    isLastQuestion,
  ]);

  // Move focus to the new question's heading on change, and announce
  // via the live region so screen reader users always know which
  // question they're on.
  useLayoutEffect(() => {
    if (showResults || isCalculating) return;
    questionHeadingRef.current?.focus();
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Question ${
        currentIndex + 1
      } of ${totalQuestions}. ${currentQuestion?.text ?? ""}`;
    }
  }, [
    currentIndex,
    showResults,
    isCalculating,
    currentQuestion?.text,
    totalQuestions,
  ]);

  // Arrow-key navigation within an option group for single_choice
  // questions. The browser default keyboard behaviour for a group of
  // <button>s is to advance focus one-at-a-time with Tab, which WCAG
  // allows, but users familiar with radiogroup semantics expect arrow
  // keys. We support both.
  const handleOptionsKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (currentQuestion?.type !== "single_choice") return;
      const buttons = Array.from(
        optionsContainerRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[data-option="true"]'
        ) ?? []
      );
      if (buttons.length === 0) return;
      const activeIndex = buttons.findIndex(
        (b) => b === document.activeElement
      );
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const next =
          buttons[(activeIndex + 1 + buttons.length) % buttons.length];
        next?.focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prev =
          buttons[(activeIndex - 1 + buttons.length) % buttons.length];
        prev?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        buttons[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
      }
    },
    [currentQuestion?.type]
  );

  const progressPct = useMemo(
    () => Math.round(((currentIndex + 1) / totalQuestions) * 100),
    [currentIndex, totalQuestions]
  );

  if (isCalculating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary-light">
        <div className="text-center" role="status" aria-live="polite">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-white/20 border-t-secondary rounded-full animate-spin mx-auto motion-reduce:animate-none" />
            <Sparkles
              className="absolute inset-0 m-auto h-10 w-10 text-secondary-dark animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analysing Your Skills
          </h2>
          <p className="text-white/60">
            Building your personalised profile...
          </p>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    return (
      <ResultsView
        result={result}
        answers={answers}
        allSkills={allSkills}
        initialTab={tab}
        localePrefix={locale}
        onTabChange={handleTabChange}
      />
    );
  }

  return (
    <div className="min-h-[80vh] bg-surface">
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <Container>
          <div className="py-4">
            <ProgressBar current={currentIndex + 1} total={totalQuestions} />
          </div>
        </Container>
      </div>

      <Container>
        <div className="max-w-2xl mx-auto py-10 sm:py-16">
          {/* Auto-advance toggle */}
          <div className="flex justify-end mb-4">
            <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvancePersisted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                aria-describedby="auto-advance-help"
              />
              Auto-advance questions
            </label>
            <span id="auto-advance-help" className="sr-only">
              When enabled, the next question loads automatically 400
              milliseconds after you pick an answer. Turn off to advance
              manually with the Next button.
            </span>
          </div>

          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8"
            role="group"
            aria-labelledby="current-question-heading"
            aria-describedby="progress-description"
          >
            <div className="mb-8">
              <span className="inline-block text-xs font-bold text-accent-dark bg-accent/10 px-3 py-1 rounded-full mb-4">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <h2
                id="current-question-heading"
                ref={questionHeadingRef}
                tabIndex={-1}
                className="text-xl sm:text-2xl font-bold text-text-primary leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 rounded"
              >
                {currentQuestion?.text}
              </h2>
              <span id="progress-description" className="sr-only">
                {progressPct} percent complete
              </span>
            </div>

            {currentQuestion && (
              <div ref={optionsContainerRef} onKeyDown={handleOptionsKeyDown}>
                <QuestionStep
                  question={currentQuestion}
                  answer={currentAnswer}
                  onAnswer={handleAnswer}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>

            {(currentQuestion?.type !== "single_choice" ||
              !autoAdvance ||
              isLastQuestion) && (
              <Button
                variant={isLastQuestion ? "secondary" : "primary"}
                onClick={handleNext}
                disabled={!hasAnswer}
                className={!hasAnswer ? "opacity-50" : ""}
              >
                {isLastQuestion ? (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    See My Results
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
