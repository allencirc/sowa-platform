"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, ArrowLeft, AlertCircle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/admin/FormField";
import { Textarea } from "@/components/admin/Textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createNewsSchema } from "@/lib/validations";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { slugify } from "@/lib/utils";
import { SeoFields } from "@/components/admin/SeoFields";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "@/components/admin/AutoSaveIndicator";
import type { NewsArticle } from "@/lib/types";

type NewsFormData = z.infer<typeof createNewsSchema>;

interface NewsFormProps {
  article?: NewsArticle;
  mode: "create" | "edit";
}

export function NewsForm({ article, mode }: NewsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NewsFormData>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: article
      ? {
          slug: article.slug,
          title: article.title,
          date: article.date,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          author: article.author,
          image: article.image ?? "",
          metaTitle: article.metaTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          metaKeywords: article.metaKeywords ?? "",
        }
      : {
          slug: "",
          title: "",
          date: new Date().toISOString().split("T")[0],
          excerpt: "",
          content: "",
          category: "",
          author: "",
        },
  });

  const autoSave = useAutoSave({
    contentType: "news",
    slug: article?.slug ?? null,
    mode,
    getValues: getValues as () => Record<string, unknown>,
    isDirty,
    onCreated: (newSlug) => router.replace(`/admin/news/${newSlug}/edit`, { scroll: false }),
  });

  const title = watch("title");

  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title));
    }
  }, [title, mode, setValue]);

  const onSubmit = async (data: NewsFormData) => {
    setError(null);
    try {
      if (mode === "create") {
        await adminPost("/api/news", data);
      } else {
        const { slug: _slug, ...updateData } = data;
        await adminPatch(`/api/news/${article!.slug}`, updateData);
      }
      router.push("/admin/news");
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
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Article Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <Input {...register("title")} placeholder="e.g. SOWA Launches New Training Programme" />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message}>
            <Input
              {...register("slug")}
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-gray-50" : ""}
            />
          </FormField>
          <FormField label="Author" required error={errors.author?.message}>
            <Input {...register("author")} placeholder="e.g. SOWA Team" />
          </FormField>
          <FormField label="Category" required error={errors.category?.message}>
            <Input {...register("category")} placeholder="e.g. Industry News" />
          </FormField>
          <FormField label="Date" required error={errors.date?.message}>
            <Input type="date" {...register("date")} />
          </FormField>
          <FormField label="Image URL">
            <Input {...register("image")} placeholder="https://..." />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Content</h2>
        <div className="space-y-4">
          <FormField
            label="Excerpt"
            required
            error={errors.excerpt?.message}
            description="Short summary shown in listings"
          >
            <Textarea
              {...register("excerpt")}
              placeholder="Brief summary of the article..."
              rows={3}
            />
          </FormField>
          <FormField label="Content" required error={errors.content?.message}>
            <RichTextEditor
              content={watch("content")}
              onChange={(html) => setValue("content", html, { shouldValidate: true })}
              placeholder="Write the full article content..."
              error={!!errors.content}
            />
          </FormField>
        </div>
      </div>

      <SeoFields
        register={register}
        errors={errors}
        setValue={setValue}
        contentTitle={title ?? ""}
        contentDescription={watch("excerpt") ?? ""}
        contentType="news article"
      />

      <div className="flex items-center justify-between">
        <Link href="/admin/news">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator
            saveStatus={autoSave.saveStatus}
            hasUnsavedChanges={autoSave.hasUnsavedChanges}
            lastSavedAt={autoSave.lastSavedAt}
            error={autoSave.error}
          />
          <Button
            type="button"
            variant="outline"
            onClick={autoSave.saveDraft}
            disabled={autoSave.saveStatus === "saving"}
          >
            <FileEdit className="h-4 w-4" />
            {autoSave.saveStatus === "saving" ? "Saving..." : "Save as Draft"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : mode === "create" ? "Publish Article" : "Update Article"}
          </Button>
        </div>
      </div>
    </form>
  );
}
