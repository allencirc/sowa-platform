"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { createSubscriptionSchema } from "@/lib/validations";
import { trackNewsletterSubscribe } from "@/lib/analytics";

type SubscriptionFormData = z.input<typeof createSubscriptionSchema>;

function formatTemplate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? params[key] : `{${key}}`,
  );
}

const TOPICS = ["CAREERS", "TRAINING", "EVENTS", "RESEARCH", "NEWS", "DIAGNOSTIC"] as const;

interface SubscriptionDict {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  topicsLabel: string;
  topics: Record<string, string>;
  frequencyLabel: string;
  frequencies: Record<string, string>;
  gdprConsent: string;
  gdprPrivacyLink: string;
  subscribe: string;
  subscribing: string;
  successTitle: string;
  successMessage: string;
  errorGeneric: string;
  errorAlreadySubscribed: string;
  compactTitle: string;
  compactSubtitle: string;
}

interface SubscriptionWidgetProps {
  dict: SubscriptionDict;
  locale: string;
  variant?: "section" | "compact";
}

export function SubscriptionWidget({ dict, locale, variant = "section" }: SubscriptionWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      email: "",
      name: "",
      topics: [],
      frequency: "WEEKLY",
      gdprConsent: false,
    },
  });

  const watchedTopics = watch("topics");
  const watchedFrequency = watch("frequency");
  const watchedGdpr = watch("gdprConsent");

  function toggleTopic(topic: string) {
    const current = watchedTopics || [];
    const next = current.includes(topic as SubscriptionFormData["topics"][number])
      ? current.filter((t) => t !== topic)
      : [...current, topic as SubscriptionFormData["topics"][number]];
    setValue("topics", next, { shouldValidate: true });
  }

  async function onSubmit(data: SubscriptionFormData) {
    setServerError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 409) {
          setServerError(dict.errorAlreadySubscribed);
        } else {
          setServerError(body?.error ?? dict.errorGeneric);
        }
        return;
      }

      setSubmittedEmail(data.email);
      setSubmitted(true);
      trackNewsletterSubscribe({ topics: data.topics });
    } catch {
      setServerError(dict.errorGeneric);
    }
  }

  const title = variant === "compact" ? dict.compactTitle : dict.title;
  const subtitle = variant === "compact" ? dict.compactSubtitle : dict.subtitle;
  const isSection = variant === "section";

  const gdprLabel = formatTemplate(dict.gdprConsent, { privacyLink: dict.gdprPrivacyLink });

  if (submitted) {
    const content = (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/10 text-secondary-dark mb-4">
          <CheckCircle className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">{dict.successTitle}</h3>
        <p className="text-text-secondary">
          {formatTemplate(dict.successMessage, { email: submittedEmail })}
        </p>
      </div>
    );

    if (isSection) {
      return (
        <section className="py-16 sm:py-20 bg-white">
          <Container>
            <div className="max-w-xl mx-auto">{content}</div>
          </Container>
        </section>
      );
    }

    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">{content}</div>
    );
  }

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email + Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={dict.emailLabel}
          type="email"
          placeholder={dict.emailPlaceholder}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={dict.nameLabel}
          type="text"
          placeholder={dict.namePlaceholder}
          {...register("name")}
        />
      </div>

      {/* Topics */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-3">{dict.topicsLabel}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {TOPICS.map((topic) => (
            <Checkbox
              key={topic}
              id={`sub-${topic.toLowerCase()}`}
              label={dict.topics[topic] ?? topic}
              checked={watchedTopics?.includes(topic) ?? false}
              onChange={() => toggleTopic(topic)}
            />
          ))}
        </div>
        {errors.topics && (
          <p className="mt-1.5 text-sm text-status-error">{errors.topics.message}</p>
        )}
      </div>

      {/* Frequency */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-3">{dict.frequencyLabel}</p>
        <div className="flex gap-4">
          {(["WEEKLY", "MONTHLY"] as const).map((freq) => (
            <label key={freq} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={freq}
                checked={watchedFrequency === freq}
                onChange={() => setValue("frequency", freq)}
                className="h-4 w-4 text-secondary border-gray-300 focus:ring-accent/20"
              />
              <span className="text-sm text-text-primary">{dict.frequencies[freq]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* GDPR Consent */}
      <div>
        <Checkbox
          id="sub-gdpr"
          label={gdprLabel}
          checked={watchedGdpr}
          onChange={(checked) => setValue("gdprConsent", checked, { shouldValidate: true })}
        />
        {errors.gdprConsent && (
          <p className="mt-1.5 text-sm text-status-error">{errors.gdprConsent.message}</p>
        )}
      </div>

      {/* Server Error */}
      {serverError && (
        <p className="text-sm text-status-error bg-status-error/5 border border-status-error/20 rounded-lg px-4 py-2">
          {serverError}
        </p>
      )}

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? dict.subscribing : dict.subscribe}
      </Button>
    </form>
  );

  if (isSection) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 text-accent-dark mb-4">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-2">{title}</h2>
              <p className="text-text-secondary">{subtitle}</p>
            </div>
            {form}
          </div>
        </Container>
      </section>
    );
  }

  // Compact variant
  return (
    <section className="py-12 sm:py-16 bg-surface">
      <Container>
        <div className="max-w-2xl mx-auto rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/10 text-accent-dark">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
          </div>
          {form}
        </div>
      </Container>
    </section>
  );
}
