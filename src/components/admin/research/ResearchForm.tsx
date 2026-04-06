"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/admin/FormField";
import { Textarea } from "@/components/admin/Textarea";
import { TagInput } from "@/components/admin/TagInput";
import { createResearchSchema } from "@/lib/validations";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { slugify } from "@/lib/utils";
import { SeoFields } from "@/components/admin/SeoFields";
import type { Research } from "@/lib/types";

type ResearchFormData = z.infer<typeof createResearchSchema>;

interface ResearchFormProps {
  research?: Research;
  mode: "create" | "edit";
}

export function ResearchForm({ research, mode }: ResearchFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResearchFormData>({
    resolver: zodResolver(createResearchSchema),
    defaultValues: research
      ? {
          slug: research.slug,
          title: research.title,
          author: research.author,
          organisation: research.organisation,
          publicationDate: research.publicationDate,
          summary: research.summary,
          categories: research.categories,
          isFeatured: research.isFeatured ?? false,
          image: research.image ?? "",
          metaTitle: research.metaTitle ?? "",
          metaDescription: research.metaDescription ?? "",
          metaKeywords: research.metaKeywords ?? "",
        }
      : {
          slug: "",
          title: "",
          author: "",
          organisation: "",
          publicationDate: new Date().toISOString().split("T")[0],
          summary: "",
          categories: [],
          isFeatured: false,
        },
  });

  const title = watch("title");

  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title));
    }
  }, [title, mode, setValue]);

  const onSubmit = async (data: ResearchFormData) => {
    setError(null);
    try {
      if (mode === "create") {
        await adminPost("/api/research", data);
      } else {
        const { slug: _slug, ...updateData } = data;
        await adminPatch(`/api/research/${research!.slug}`, updateData);
      }
      router.push("/admin/research");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Research Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <Input {...register("title")} placeholder="e.g. Offshore Wind Skills Gap Analysis" />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message}>
            <Input
              {...register("slug")}
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-gray-50" : ""}
            />
          </FormField>
          <FormField label="Author" required error={errors.author?.message}>
            <Input {...register("author")} placeholder="e.g. Dr. Sarah Murphy" />
          </FormField>
          <FormField label="Organisation" required error={errors.organisation?.message}>
            <Input {...register("organisation")} placeholder="e.g. SEAI" />
          </FormField>
          <FormField label="Publication Date" required error={errors.publicationDate?.message}>
            <Input type="date" {...register("publicationDate")} />
          </FormField>
          <FormField label="Image URL">
            <Input {...register("image")} placeholder="https://..." />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Content</h2>
        <FormField label="Summary" required error={errors.summary?.message}>
          <Textarea {...register("summary")} placeholder="Summarise the research..." rows={5} />
        </FormField>
        <div className="mt-4">
          <FormField
            label="Categories"
            required
            error={errors.categories?.message}
            description="Press Enter to add categories"
          >
            <TagInput
              value={watch("categories") ?? []}
              onChange={(val) => setValue("categories", val, { shouldValidate: true })}
              placeholder="e.g. Skills, Policy, Labour Market"
            />
          </FormField>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            {...register("isFeatured")}
            className="h-4 w-4 rounded border-gray-300 text-secondary-dark focus:ring-accent"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-text-primary">
            Featured Research
          </label>
        </div>
      </div>

      <SeoFields
        register={register}
        errors={errors}
        setValue={setValue}
        contentTitle={title ?? ""}
        contentDescription={watch("summary") ?? ""}
        contentType="research"
      />

      <div className="flex items-center justify-between">
        <Link href="/admin/research">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to Research
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Research" : "Update Research"}
        </Button>
      </div>
    </form>
  );
}
