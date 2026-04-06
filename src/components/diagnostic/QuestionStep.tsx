"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagnosticQuestion } from "@/lib/types";

interface QuestionStepProps {
  question: DiagnosticQuestion;
  answer: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
}

export function QuestionStep({ question, answer, onAnswer }: QuestionStepProps) {
  if (question.type === "single_choice") {
    return (
      <SingleChoice
        question={question}
        selected={typeof answer === "string" ? answer : undefined}
        onSelect={onAnswer}
      />
    );
  }

  if (question.type === "multiple_choice") {
    const selected = Array.isArray(answer) ? answer : [];
    return <MultipleChoice question={question} selected={selected} onSelect={onAnswer} />;
  }

  if (question.type === "scale") {
    return (
      <ScaleQuestion
        question={question}
        selected={typeof answer === "string" ? answer : undefined}
        onSelect={onAnswer}
      />
    );
  }

  return null;
}

/* ─── Single Choice ────────────────────────────────────── */

function SingleChoice({
  question,
  selected,
  onSelect,
}: {
  question: DiagnosticQuestion;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-3" role="radiogroup">
      {question.options?.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-option="true"
            onClick={() => onSelect(opt.value)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onSelect(opt.value);
              }
            }}
            className={cn(
              "w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
              "hover:border-secondary/40 hover:bg-secondary/5",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2",
              isSelected
                ? "border-secondary bg-secondary/5 shadow-sm shadow-secondary/10"
                : "border-gray-100 bg-white",
            )}
          >
            <div className="flex items-center gap-4">
              {/* Radio indicator */}
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-secondary bg-secondary" : "border-gray-300",
                )}
                aria-hidden="true"
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span
                className={cn(
                  "text-base font-medium transition-colors",
                  isSelected ? "text-text-primary" : "text-text-secondary",
                )}
              >
                {opt.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Multiple Choice ──────────────────────────────────── */

function MultipleChoice({
  question,
  selected,
  onSelect,
}: {
  question: DiagnosticQuestion;
  selected: string[];
  onSelect: (value: string[]) => void;
}) {
  const toggle = (value: string) => {
    // "none" is exclusive
    if (value === "none") {
      onSelect(selected.includes("none") ? [] : ["none"]);
      return;
    }
    const withoutNone = selected.filter((v) => v !== "none");
    if (withoutNone.includes(value)) {
      onSelect(withoutNone.filter((v) => v !== value));
    } else {
      onSelect([...withoutNone, value]);
    }
  };

  return (
    <div className="space-y-3" role="group" aria-label="Select all that apply">
      <p className="text-sm text-text-muted mb-1">Select all that apply</p>
      {question.options?.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            data-option="true"
            onClick={() => toggle(opt.value)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle(opt.value);
              }
            }}
            className={cn(
              "w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
              "hover:border-secondary/40 hover:bg-secondary/5",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2",
              isSelected
                ? "border-secondary bg-secondary/5 shadow-sm shadow-secondary/10"
                : "border-gray-100 bg-white",
            )}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox indicator */}
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-secondary bg-secondary" : "border-gray-300",
                )}
              >
                {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </div>
              <span
                className={cn(
                  "text-base font-medium transition-colors",
                  isSelected ? "text-text-primary" : "text-text-secondary",
                )}
              >
                {opt.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Scale ────────────────────────────────────────────── */

function ScaleQuestion({
  question,
  selected,
  onSelect,
}: {
  question: DiagnosticQuestion;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 5;
  const values = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));

  return (
    <div>
      {/* Scale circles */}
      <div
        className="flex items-center justify-center gap-3 sm:gap-5 mb-6"
        role="radiogroup"
        aria-label={`Rate from ${min} to ${max}`}
      >
        {values.map((v) => {
          const isSelected = selected === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={question.scaleLabels?.[v] ? `${v} — ${question.scaleLabels[v]}` : `${v}`}
              data-option="true"
              onClick={() => onSelect(v)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onSelect(v);
                }
              }}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-200 cursor-pointer",
                "hover:border-secondary/60 hover:bg-secondary/10 hover:scale-105 motion-reduce:hover:scale-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2",
                isSelected
                  ? "border-secondary bg-secondary text-primary shadow-lg shadow-secondary/20 scale-110 motion-reduce:scale-100"
                  : "border-gray-200 bg-white text-text-secondary",
              )}
            >
              {v}
            </button>
          );
        })}
      </div>

      {/* Scale labels */}
      {question.scaleLabels && (
        <div className="flex justify-between px-2">
          {Object.entries(question.scaleLabels).map(([key, label]) => (
            <span key={key} className="text-xs sm:text-sm text-text-muted font-medium">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
