"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Users, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTeamAssessmentSchema } from "@/lib/validations";

type TeamFormData = z.infer<typeof createTeamAssessmentSchema>;

interface TeamAssessmentFormProps {
  dict: {
    teamName: string;
    teamNamePlaceholder: string;
    managerEmail: string;
    managerEmailPlaceholder: string;
    responseThreshold: string;
    responseThresholdHelp: string;
    gdprConsent: string;
    gdprPrivacyLink: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    teamLinkLabel: string;
    reportLinkLabel: string;
    copyLink: string;
    copied: string;
    createAnother: string;
  };
  locale: string;
}

export function TeamAssessmentForm({ dict, locale }: TeamAssessmentFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [teamLink, setTeamLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    resolver: zodResolver(createTeamAssessmentSchema),
    defaultValues: {
      teamName: "",
      managerEmail: "",
      responseThreshold: 5,
      gdprConsent: false,
    },
  });

  const onSubmit = async (data: TeamFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      const result = await res.json();
      setTeamLink(result.teamLink);
      setSubmitted(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(teamLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select input text
    }
  }, [teamLink]);

  const handleReset = () => {
    setSubmitted(false);
    setTeamLink("");
    setCopied(false);
    setServerError(null);
    reset();
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">{dict.successTitle}</h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">{dict.successDescription}</p>

        <div className="bg-surface rounded-xl border border-gray-200 p-6 max-w-lg mx-auto mb-6">
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {dict.teamLinkLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={teamLink}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-text-primary font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {dict.copied}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {dict.copyLink}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-2">{dict.reportLinkLabel}</p>
        </div>

        <button
          onClick={handleReset}
          className="text-sm text-accent hover:text-accent-dark underline underline-offset-2"
        >
          {dict.createAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div
          className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p>{serverError}</p>
        </div>
      )}

      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-text-primary mb-1.5">
          {dict.teamName}
        </label>
        <Input
          id="teamName"
          placeholder={dict.teamNamePlaceholder}
          {...register("teamName")}
          aria-invalid={!!errors.teamName}
        />
        {errors.teamName && <p className="text-sm text-red-600 mt-1">{errors.teamName.message}</p>}
      </div>

      <div>
        <label
          htmlFor="managerEmail"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {dict.managerEmail}
        </label>
        <Input
          id="managerEmail"
          type="email"
          placeholder={dict.managerEmailPlaceholder}
          {...register("managerEmail")}
          aria-invalid={!!errors.managerEmail}
        />
        {errors.managerEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.managerEmail.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="responseThreshold"
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {dict.responseThreshold}
        </label>
        <Input
          id="responseThreshold"
          type="number"
          min={1}
          max={500}
          {...register("responseThreshold", { valueAsNumber: true })}
          aria-invalid={!!errors.responseThreshold}
          aria-describedby="threshold-help"
        />
        <p id="threshold-help" className="text-xs text-text-muted mt-1">
          {dict.responseThresholdHelp}
        </p>
        {errors.responseThreshold && (
          <p className="text-sm text-red-600 mt-1">{errors.responseThreshold.message}</p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="gdprConsent"
          {...register("gdprConsent")}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
        />
        <label htmlFor="gdprConsent" className="text-sm text-text-secondary leading-snug">
          {dict.gdprConsent}{" "}
          <Link href={`/${locale}/privacy`} className="text-accent underline underline-offset-2">
            {dict.gdprPrivacyLink}
          </Link>
        </label>
      </div>
      {errors.gdprConsent && <p className="text-sm text-red-600">{errors.gdprConsent.message}</p>}

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        <Users className="h-5 w-5" />
        {isSubmitting ? dict.submitting : dict.submit}
      </Button>
    </form>
  );
}
