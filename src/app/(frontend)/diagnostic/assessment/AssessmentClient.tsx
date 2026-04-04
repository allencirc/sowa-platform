"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  TrendingDown,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";
import { QuestionStep } from "@/components/diagnostic/QuestionStep";
import { ResultsChart } from "@/components/diagnostic/ResultsChart";
import { GapCard } from "@/components/diagnostic/GapCard";
import { RecommendationCards } from "@/components/diagnostic/RecommendationCards";
import { AISummary } from "@/components/diagnostic/AISummary";
import { calculateResults } from "@/lib/diagnostic";
import type { Career, Course, DiagnosticQuestion, DiagnosticResult, Skill } from "@/lib/types";

interface AssessmentClientProps {
  questions: DiagnosticQuestion[];
  allSkills: Skill[];
  allCareers: Career[];
  allCourses: Course[];
}

export default function AssessmentClient({ questions, allSkills, allCareers, allCourses }: AssessmentClientProps) {
  const router = useRouter();
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const hasAnswer =
    currentAnswer !== undefined &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== "");

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (!hasAnswer) return;

    if (isLastQuestion) {
      setIsCalculating(true);
      setTimeout(() => {
        const res = calculateResults(answers, {
          questions,
          allSkills,
          allCareers,
          allCourses,
        });
        setResult(res);
        setIsCalculating(false);
        setShowResults(true);
      }, 1500);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasAnswer, isLastQuestion, answers]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.push("/diagnostic");
    }
  }, [currentIndex, router]);

  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showResults]);

  useEffect(() => {
    if (
      currentQuestion?.type === "single_choice" &&
      hasAnswer &&
      !isLastQuestion
    ) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentAnswer, currentQuestion?.type, hasAnswer, isLastQuestion]);

  if (isCalculating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary-light">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-white/20 border-t-secondary rounded-full animate-spin mx-auto" />
            <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-secondary animate-pulse" />
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
    const topGaps = result.gaps.slice(0, 3);

    let totalScore = 0;
    let totalMax = 0;
    for (const [slug, score] of Object.entries(result.scores)) {
      const max = result.maxPossible[slug] ?? 0;
      if (max > 0) {
        totalScore += score;
        totalMax += max;
      }
    }
    const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    return (
      <div ref={resultsRef}>
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary-light py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
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
                <Trophy className="h-10 w-10 text-secondary" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Your OWE Skills Profile
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Here&apos;s your personalised skills assessment and recommendations
              </p>

              <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-10 py-8">
                <div className="relative w-32 h-32 mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
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
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
                    {overallPct}%
                  </span>
                </div>
                <span className="text-sm font-medium text-white/70">
                  Overall Score
                </span>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-16 bg-white">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                Skills Breakdown
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Your scores across skill categories compared to the industry benchmark
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
                    <TrendingDown className="h-5 w-5 text-status-error" />
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
    );
  }

  return (
    <div className="min-h-[80vh] bg-surface">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <Container>
          <div className="py-4">
            <ProgressBar
              current={currentIndex + 1}
              total={totalQuestions}
            />
          </div>
        </Container>
      </div>

      <Container>
        <div className="max-w-2xl mx-auto py-10 sm:py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8">
            <div className="mb-8">
              <span className="inline-block text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug">
                {currentQuestion?.text}
              </h2>
            </div>

            {currentQuestion && (
              <QuestionStep
                question={currentQuestion}
                answer={currentAnswer}
                onAnswer={handleAnswer}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {(currentQuestion?.type !== "single_choice" || isLastQuestion) && (
              <Button
                variant={isLastQuestion ? "secondary" : "primary"}
                onClick={handleNext}
                disabled={!hasAnswer}
                className={!hasAnswer ? "opacity-50" : ""}
              >
                {isLastQuestion ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    See My Results
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
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
