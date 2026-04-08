"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { contactFormSchema } from "@/lib/validations";

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  dict: {
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      organisation: string;
      organisationPlaceholder: string;
      subject: string;
      subjectPlaceholder: string;
      subjects: Record<string, string>;
      message: string;
      messagePlaceholder: string;
      gdprConsent: string;
      gdprPrivacyLink: string;
      submit: string;
      submitting: string;
    };
    success: {
      title: string;
      description: string;
      sendAnother: string;
    };
  };
  locale: string;
}

export function ContactForm({ dict, locale }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const subjectOptions = Object.entries(dict.form.subjects).map(([value, label]) => ({
    value,
    label,
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organisation: "",
      subject: undefined,
      message: "",
      gdprConsent: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setServerError(null);
    reset();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-8 w-8 text-secondary-dark" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-text-primary">{dict.success.title}</h2>
        <p className="mb-6 max-w-md text-sm text-text-secondary">{dict.success.description}</p>
        <Button variant="outline" onClick={handleReset}>
          {dict.success.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      aria-label={dict.form.submit}
      noValidate
    >
      {serverError && (
        <div
          className="flex items-start gap-2 rounded-lg bg-status-error/10 p-3 text-sm text-status-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="contact-name"
          label={`${dict.form.name} *`}
          placeholder={dict.form.namePlaceholder}
          autoComplete="name"
          error={errors.name?.message}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          {...register("name")}
        />

        <Input
          id="contact-email"
          label={`${dict.form.email} *`}
          type="email"
          placeholder={dict.form.emailPlaceholder}
          autoComplete="email"
          error={errors.email?.message}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          {...register("email")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="contact-organisation"
          label={dict.form.organisation}
          placeholder={dict.form.organisationPlaceholder}
          autoComplete="organization"
          {...register("organisation")}
        />

        <Select
          id="contact-subject"
          label={`${dict.form.subject} *`}
          options={subjectOptions}
          placeholder={dict.form.subjectPlaceholder}
          aria-required="true"
          aria-invalid={!!errors.subject}
          {...register("subject")}
        />
        {errors.subject && (
          <p className="text-sm text-status-error sm:col-start-2 -mt-3">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {dict.form.message} *
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder={dict.form.messagePlaceholder}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none resize-none"
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-sm text-status-error">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-surface p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary-dark focus:ring-secondary"
            aria-required="true"
            aria-invalid={!!errors.gdprConsent}
            {...register("gdprConsent")}
          />
          <span className="text-sm text-text-secondary">
            {dict.form.gdprConsent}{" "}
            <Link href={`/${locale}/privacy`} className="text-accent-dark underline">
              {dict.form.gdprPrivacyLink}
            </Link>
            . *
          </span>
        </label>
        {errors.gdprConsent && (
          <p className="mt-1.5 text-sm text-status-error">{errors.gdprConsent.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          dict.form.submitting
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" aria-hidden="true" />
            {dict.form.submit}
          </span>
        )}
      </Button>
    </form>
  );
}
