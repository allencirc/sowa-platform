"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/admin/FormField";
import { Textarea } from "@/components/admin/Textarea";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { TagInput } from "@/components/admin/TagInput";
import {
  createCareerSchema,
  CareerSectorEnum,
  EntryLevelEnum,
  PathwayTypeEnum,
} from "@/lib/validations";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { slugify } from "@/lib/utils";
import { SeoFields } from "@/components/admin/SeoFields";
import type { Career, Skill, Course } from "@/lib/types";

type CareerFormData = z.infer<typeof createCareerSchema>;

interface CareerFormProps {
  career?: Career;
  mode: "create" | "edit";
}

const sectorOptions = CareerSectorEnum.options.map((s) => ({ label: s, value: s }));
const levelOptions = EntryLevelEnum.options.map((l) => ({ label: l, value: l }));
const pathwayTypeOptions = PathwayTypeEnum.options.map((t) => ({ label: t, value: t }));

export function CareerForm({ career, mode }: CareerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{ label: string; value: string }[]>([]);
  const [courses, setCourses] = useState<{ label: string; value: string }[]>([]);
  const [allCareers, setAllCareers] = useState<{ label: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CareerFormData>({
    resolver: zodResolver(createCareerSchema),
    defaultValues: career
      ? {
          slug: career.slug,
          title: career.title,
          sector: career.sector,
          entryLevel: career.entryLevel,
          description: career.description,
          salaryRange: career.salaryRange,
          keyResponsibilities: career.keyResponsibilities ?? [],
          qualifications: career.qualifications,
          workingConditions: career.workingConditions ?? "",
          growthOutlook: career.growthOutlook ?? "",
          skills: career.skills,
          pathwayConnections: career.pathwayConnections ?? [],
          metaTitle: career.metaTitle ?? "",
          metaDescription: career.metaDescription ?? "",
          metaKeywords: career.metaKeywords ?? "",
          relatedCourses: career.relatedCourses ?? [],
        }
      : {
          slug: "",
          title: "",
          sector: "Operations & Maintenance",
          entryLevel: "Entry",
          description: "",
          qualifications: [],
          skills: [],
          keyResponsibilities: [],
          pathwayConnections: [],
          relatedCourses: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pathwayConnections",
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
      fetch("/api/courses?limit=100").then((r) => r.json()),
      fetch("/api/careers?limit=100").then((r) => r.json()),
    ]).then(([skillsRes, coursesRes, careersRes]) => {
      setSkills((skillsRes.data ?? []).map((s: Skill) => ({ label: s.name, value: s.slug })));
      setCourses((coursesRes.data ?? []).map((c: Course) => ({ label: c.title, value: c.slug })));
      setAllCareers(
        (careersRes.data ?? [])
          .filter((c: Career) => c.slug !== career?.slug)
          .map((c: Career) => ({ label: c.title, value: c.slug })),
      );
    });
  }, [career?.slug]);

  const onSubmit = async (data: CareerFormData) => {
    setError(null);
    try {
      if (mode === "create") {
        await adminPost("/api/careers", data);
      } else {
        const { slug: _slug, ...updateData } = data;
        await adminPatch(`/api/careers/${career!.slug}`, updateData);
      }
      router.push("/admin/careers");
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
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
            <Input id="title" {...register("title")} placeholder="e.g. Wind Turbine Technician" />
          </FormField>

          <FormField label="Slug" htmlFor="slug" required error={errors.slug?.message}>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="wind-turbine-technician"
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-gray-50" : ""}
            />
          </FormField>

          <FormField label="Sector" htmlFor="sector" required error={errors.sector?.message}>
            <Select id="sector" options={sectorOptions} {...register("sector")} />
          </FormField>

          <FormField
            label="Entry Level"
            htmlFor="entryLevel"
            required
            error={errors.entryLevel?.message}
          >
            <Select id="entryLevel" options={levelOptions} {...register("entryLevel")} />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField
            label="Description"
            htmlFor="description"
            required
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe this career role..."
              rows={4}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Salary & Conditions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Salary Min (€)" htmlFor="salaryMin">
            <Input
              id="salaryMin"
              type="number"
              {...register("salaryRange.min", { valueAsNumber: true })}
              placeholder="30000"
            />
          </FormField>
          <FormField label="Salary Max (€)" htmlFor="salaryMax">
            <Input
              id="salaryMax"
              type="number"
              {...register("salaryRange.max", { valueAsNumber: true })}
              placeholder="55000"
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Working Conditions" htmlFor="workingConditions">
            <Textarea
              id="workingConditions"
              {...register("workingConditions")}
              placeholder="Describe typical working conditions..."
              rows={3}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Growth Outlook" htmlFor="growthOutlook">
            <Textarea
              id="growthOutlook"
              {...register("growthOutlook")}
              placeholder="Career growth prospects..."
              rows={3}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Qualifications & Skills</h2>
        <div className="space-y-4">
          <FormField
            label="Qualifications"
            required
            error={errors.qualifications?.message}
            description="Press Enter to add each qualification"
          >
            <TagInput
              value={watch("qualifications") ?? []}
              onChange={(val) => setValue("qualifications", val, { shouldValidate: true })}
              placeholder="e.g. Level 6 qualification in engineering..."
            />
          </FormField>

          <FormField
            label="Key Responsibilities"
            description="Press Enter to add each responsibility"
          >
            <TagInput
              value={watch("keyResponsibilities") ?? []}
              onChange={(val) => setValue("keyResponsibilities", val)}
              placeholder="e.g. Perform routine maintenance..."
            />
          </FormField>

          <FormField label="Skills" required error={errors.skills?.message}>
            <MultiSelect
              options={skills}
              value={watch("skills") ?? []}
              onChange={(val) => setValue("skills", val, { shouldValidate: true })}
              placeholder="Select skills..."
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Related Content</h2>

        <FormField label="Related Courses" className="mb-6">
          <MultiSelect
            options={courses}
            value={watch("relatedCourses") ?? []}
            onChange={(val) => setValue("relatedCourses", val)}
            placeholder="Select related courses..."
          />
        </FormField>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Pathway Connections</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ to: "", type: "progression", timeframe: "" })}
            >
              <Plus className="h-3.5 w-3.5" /> Add Connection
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-text-muted">No pathway connections yet.</p>
          )}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3"
              >
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  <Select
                    options={allCareers}
                    placeholder="Target career..."
                    {...register(`pathwayConnections.${index}.to`)}
                  />
                  <Select
                    options={pathwayTypeOptions}
                    {...register(`pathwayConnections.${index}.type`)}
                  />
                  <Input
                    placeholder="e.g. 2-3 years"
                    {...register(`pathwayConnections.${index}.timeframe`)}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-status-error" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SeoFields
        register={register}
        errors={errors}
        setValue={setValue}
        contentTitle={title ?? ""}
        contentDescription={watch("description") ?? ""}
        contentType="career"
      />

      <div className="flex items-center justify-between">
        <Link href="/admin/careers">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to Careers
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Career" : "Update Career"}
        </Button>
      </div>
    </form>
  );
}
