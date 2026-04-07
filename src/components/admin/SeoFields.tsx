"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/admin/FormField";
import { Textarea } from "@/components/admin/Textarea";
import { useAIEnabled } from "@/hooks/useAIEnabled";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";

interface SeoFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  contentTitle: string;
  contentDescription: string;
  contentType: string;
}

export function SeoFields({
  register,
  errors,
  setValue,
  contentTitle,
  contentDescription,
  contentType,
}: SeoFieldsProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const { aiAvailable } = useAIEnabled();

  async function handleGenerate() {
    if (!contentTitle.trim()) {
      setGenError("Add a title first so the AI has content to work with.");
      return;
    }

    setGenerating(true);
    setGenError(null);

    try {
      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: contentTitle,
          description: contentDescription || contentTitle,
          contentType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const seo = await res.json();
      setValue("metaTitle", seo.metaTitle, { shouldValidate: true });
      setValue("metaDescription", seo.metaDescription, { shouldValidate: true });
      setValue("metaKeywords", seo.metaKeywords, { shouldValidate: true });

      if (!open) setOpen(true);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate SEO");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Search className="h-5 w-5 text-accent-dark" />
          SEO
        </h2>
        {open ? (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronRight className="h-5 w-5 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {aiAvailable && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? "Generating..." : "Generate SEO"}
              </button>
              {genError && <span className="text-sm text-status-error">{genError}</span>}
            </div>
          )}

          <FormField
            label="Meta Title"
            description="Custom page title for search engines (max 70 chars). Leave blank to use the default title."
            error={(errors.metaTitle as { message?: string })?.message}
          >
            <Input
              {...register("metaTitle")}
              placeholder="e.g. Wind Turbine Technician Careers — SOWA"
              maxLength={70}
            />
          </FormField>

          <FormField
            label="Meta Description"
            description="Summary shown in search results (max 160 chars). Leave blank to auto-generate from content."
            error={(errors.metaDescription as { message?: string })?.message}
          >
            <Textarea
              {...register("metaDescription")}
              placeholder="A concise description for search engine results..."
              rows={2}
              maxLength={160}
            />
          </FormField>

          <FormField
            label="Meta Keywords"
            description="Comma-separated keywords for search engines. Leave blank for defaults."
            error={(errors.metaKeywords as { message?: string })?.message}
          >
            <Input
              {...register("metaKeywords")}
              placeholder="e.g. offshore wind, careers, technician, Ireland"
              maxLength={500}
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
