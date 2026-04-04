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
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/admin/FormField";
import { Textarea } from "@/components/admin/Textarea";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { TagInput } from "@/components/admin/TagInput";
import {
  createCourseSchema,
  ProviderTypeEnum,
  DeliveryFormatEnum,
} from "@/lib/validations";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { slugify } from "@/lib/utils";
import type { Course, Skill, Career } from "@/lib/types";

type CourseFormData = z.infer<typeof createCourseSchema>;

interface CourseFormProps {
  course?: Course;
  mode: "create" | "edit";
}

const providerTypeOptions = ProviderTypeEnum.options.map((p) => ({ label: p.replace("_", " "), value: p }));
const formatOptions = DeliveryFormatEnum.options.map((f) => ({ label: f, value: f }));

export function CourseForm({ course, mode }: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{ label: string; value: string }[]>([]);
  const [careers, setCareers] = useState<{ label: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: course
      ? {
          slug: course.slug,
          title: course.title,
          provider: course.provider,
          providerType: course.providerType,
          description: course.description,
          entryRequirements: course.entryRequirements ?? "",
          deliveryFormat: course.deliveryFormat,
          location: course.location ?? "",
          nfqLevel: course.nfqLevel ?? undefined,
          duration: course.duration,
          cost: course.cost,
          costNotes: course.costNotes ?? "",
          nextStartDate: course.nextStartDate ?? "",
          accredited: course.accredited ?? false,
          certificationAwarded: course.certificationAwarded ?? "",
          skills: course.skills,
          careerRelevance: course.careerRelevance,
          tags: course.tags,
        }
      : {
          slug: "",
          title: "",
          provider: "",
          providerType: "University",
          description: "",
          deliveryFormat: "In-Person",
          duration: "",
          cost: 0,
          skills: [],
          careerRelevance: [],
          tags: [],
        },
  });

  const title = watch("title");

  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title));
    }
  }, [title, mode, setValue]);

  useEffect(() => {
    Promise.all([
      fetch("/api/skills?limit=100").then((r) => r.json()),
      fetch("/api/careers?limit=100").then((r) => r.json()),
    ]).then(([skillsRes, careersRes]) => {
      setSkills((skillsRes.data ?? []).map((s: Skill) => ({ label: s.name, value: s.slug })));
      setCareers((careersRes.data ?? []).map((c: Career) => ({ label: c.title, value: c.slug })));
    });
  }, []);

  const onSubmit = async (data: CourseFormData) => {
    setError(null);
    try {
      if (mode === "create") {
        await adminPost("/api/courses", data);
      } else {
        const { slug: _slug, ...updateData } = data;
        await adminPatch(`/api/courses/${course!.slug}`, updateData);
      }
      router.push("/admin/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <Input {...register("title")} placeholder="e.g. GWO Basic Safety Training" />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message}>
            <Input {...register("slug")} readOnly={mode === "edit"} className={mode === "edit" ? "bg-gray-50" : ""} />
          </FormField>
          <FormField label="Provider" required error={errors.provider?.message}>
            <Input {...register("provider")} placeholder="e.g. Atlantic Technological University" />
          </FormField>
          <FormField label="Provider Type" required error={errors.providerType?.message}>
            <Select options={providerTypeOptions} {...register("providerType")} />
          </FormField>
          <FormField label="Delivery Format" required error={errors.deliveryFormat?.message}>
            <Select options={formatOptions} {...register("deliveryFormat")} />
          </FormField>
          <FormField label="Location">
            <Input {...register("location")} placeholder="e.g. Galway, Ireland" />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Description" required error={errors.description?.message}>
            <Textarea {...register("description")} placeholder="Describe this course..." rows={4} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Duration" required error={errors.duration?.message}>
            <Input {...register("duration")} placeholder="e.g. 5 days" />
          </FormField>
          <FormField label="Cost (€)" required error={errors.cost?.message}>
            <Input type="number" {...register("cost", { valueAsNumber: true })} placeholder="0" />
          </FormField>
          <FormField label="Cost Notes">
            <Input {...register("costNotes")} placeholder="e.g. Fully funded by Skillnet" />
          </FormField>
          <FormField label="NFQ Level">
            <Input type="number" min={1} max={10} {...register("nfqLevel", { valueAsNumber: true })} placeholder="1-10" />
          </FormField>
          <FormField label="Next Start Date">
            <Input type="date" {...register("nextStartDate")} />
          </FormField>
          <FormField label="Certification Awarded">
            <Input {...register("certificationAwarded")} placeholder="e.g. GWO BST Certificate" />
          </FormField>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="accredited" {...register("accredited")} className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-accent" />
          <label htmlFor="accredited" className="text-sm font-medium text-text-primary">Accredited Programme</label>
        </div>
        <div className="mt-4">
          <FormField label="Entry Requirements">
            <Textarea {...register("entryRequirements")} placeholder="Prerequisites for this course..." rows={3} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Skills & Relevance</h2>
        <div className="space-y-4">
          <FormField label="Skills">
            <MultiSelect options={skills} value={watch("skills") ?? []} onChange={(val) => setValue("skills", val)} placeholder="Select skills..." />
          </FormField>
          <FormField label="Career Relevance">
            <MultiSelect options={careers} value={watch("careerRelevance") ?? []} onChange={(val) => setValue("careerRelevance", val)} placeholder="Select related careers..." />
          </FormField>
          <FormField label="Tags" description="Press Enter to add tags">
            <TagInput value={watch("tags") ?? []} onChange={(val) => setValue("tags", val)} placeholder="e.g. safety, offshore, GWO" />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/courses">
          <Button type="button" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Courses</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Course" : "Update Course"}
        </Button>
      </div>
    </form>
  );
}
