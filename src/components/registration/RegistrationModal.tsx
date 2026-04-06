"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createRegistrationSchema } from "@/lib/validations";
import { trackCourseRegister, trackEventRegister } from "@/lib/analytics";

type RegistrationFormData = z.infer<typeof createRegistrationSchema>;

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  type: "EVENT" | "COURSE";
  contentId: string;
  contentTitle: string;
  showDietary?: boolean;
}

const roleOptions = [
  { label: "Student", value: "Student" },
  { label: "Professional", value: "Professional" },
  { label: "Employer", value: "Employer" },
  { label: "Educator", value: "Educator" },
  { label: "Career Changer", value: "Career Changer" },
  { label: "Other", value: "Other" },
];

export function RegistrationModal({
  open,
  onClose,
  type,
  contentId,
  contentTitle,
  showDietary = false,
}: RegistrationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(createRegistrationSchema),
    defaultValues: {
      type,
      contentId,
      name: "",
      email: "",
      phone: "",
      organisation: "",
      role: "",
      dietaryRequirements: "",
      additionalNotes: "",
      gdprConsent: false,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/registrations", {
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
      if (type === "COURSE") {
        trackCourseRegister({
          course_id: contentId,
          course_title: contentTitle,
        });
      } else {
        trackEventRegister({
          event_id: contentId,
          event_title: contentTitle,
        });
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setServerError(null);
    reset();
    onClose();
  };

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} className="max-w-md">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <CheckCircle2 className="h-8 w-8 text-secondary-dark" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Registration Submitted</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Thank you for registering for <span className="font-medium">{contentTitle}</span>.
            You&apos;ll receive a confirmation email shortly.
          </p>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={type === "EVENT" ? "Register for Event" : "Express Interest"}
      className="max-w-lg"
    >
      <p className="mb-5 text-sm text-text-secondary">
        {type === "EVENT"
          ? `Register your place for "${contentTitle}".`
          : `Express your interest in "${contentTitle}" and we'll connect you with the training provider.`}
      </p>

      {serverError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-status-error/10 p-3 text-sm text-status-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("type")} />
        <input type="hidden" {...register("contentId")} />

        <Input
          id="reg-name"
          label="Full Name *"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          id="reg-email"
          label="Email Address *"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="reg-phone"
          label="Phone Number"
          type="tel"
          placeholder="+353..."
          {...register("phone")}
        />

        <Input
          id="reg-organisation"
          label="Organisation"
          placeholder="Your company or institution"
          {...register("organisation")}
        />

        <Select
          id="reg-role"
          label="Your Role"
          options={roleOptions}
          placeholder="Select your role..."
          {...register("role")}
        />

        {showDietary && (
          <Input
            id="reg-dietary"
            label="Dietary Requirements"
            placeholder="e.g. Vegetarian, Gluten-free"
            {...register("dietaryRequirements")}
          />
        )}

        <div>
          <label htmlFor="reg-notes" className="mb-1.5 block text-sm font-medium text-text-primary">
            Additional Notes
          </label>
          <textarea
            id="reg-notes"
            rows={3}
            placeholder="Anything else you'd like us to know?"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none resize-none"
            {...register("additionalNotes")}
          />
        </div>

        <div className="rounded-lg bg-surface p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-secondary-dark focus:ring-secondary"
              {...register("gdprConsent")}
            />
            <span className="text-sm text-text-secondary">
              I consent to SOWA processing my personal data for the purpose of this registration.
              Your data will be handled in accordance with our{" "}
              <Link href="/privacy" className="text-accent-dark underline">
                Privacy Policy
              </Link>
              . *
            </span>
          </label>
          {errors.gdprConsent && (
            <p className="mt-1.5 text-sm text-status-error">{errors.gdprConsent.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Submitting..." : type === "EVENT" ? "Register" : "Express Interest"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
