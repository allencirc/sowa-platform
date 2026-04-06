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
import { createEventSchema, EventTypeEnum, LocationTypeEnum } from "@/lib/validations";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { slugify } from "@/lib/utils";
import { SeoFields } from "@/components/admin/SeoFields";
import type { Event } from "@/lib/types";

type EventFormData = z.infer<typeof createEventSchema>;

interface EventFormProps {
  event?: Event;
  mode: "create" | "edit";
}

const eventTypeOptions = EventTypeEnum.options.map((t) => ({ label: t, value: t }));
const locationTypeOptions = LocationTypeEnum.options.map((l) => ({ label: l, value: l }));

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: event
      ? {
          slug: event.slug,
          title: event.title,
          type: event.type,
          startDate: event.startDate?.slice(0, 16) ?? "",
          endDate: event.endDate?.slice(0, 16) ?? "",
          locationType: event.locationType,
          location: event.location ?? "",
          description: event.description,
          capacity: event.capacity,
          image: event.image ?? "",
          metaTitle: event.metaTitle ?? "",
          metaDescription: event.metaDescription ?? "",
          metaKeywords: event.metaKeywords ?? "",
        }
      : {
          slug: "",
          title: "",
          type: "Workshop",
          startDate: "",
          locationType: "Physical",
          description: "",
        },
  });

  const title = watch("title");

  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title));
    }
  }, [title, mode, setValue]);

  const onSubmit = async (data: EventFormData) => {
    setError(null);
    try {
      if (mode === "create") {
        await adminPost("/api/events", data);
      } else {
        const { slug: _slug, ...updateData } = data;
        await adminPatch(`/api/events/${event!.slug}`, updateData);
      }
      router.push("/admin/events");
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
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Event Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <Input {...register("title")} placeholder="e.g. OWE Skills Summit 2025" />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message}>
            <Input
              {...register("slug")}
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-gray-50" : ""}
            />
          </FormField>
          <FormField label="Event Type" required error={errors.type?.message}>
            <Select options={eventTypeOptions} {...register("type")} />
          </FormField>
          <FormField label="Capacity">
            <Input
              type="number"
              min={1}
              {...register("capacity", { valueAsNumber: true })}
              placeholder="e.g. 200"
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Date & Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start Date/Time" required error={errors.startDate?.message}>
            <Input type="datetime-local" {...register("startDate")} />
          </FormField>
          <FormField label="End Date/Time">
            <Input type="datetime-local" {...register("endDate")} />
          </FormField>
          <FormField label="Location Type" required error={errors.locationType?.message}>
            <Select options={locationTypeOptions} {...register("locationType")} />
          </FormField>
          <FormField label="Location">
            <Input {...register("location")} placeholder="e.g. Convention Centre Dublin" />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Content</h2>
        <FormField label="Description" required error={errors.description?.message}>
          <Textarea {...register("description")} placeholder="Describe this event..." rows={5} />
        </FormField>
        <div className="mt-4">
          <FormField label="Image URL">
            <Input {...register("image")} placeholder="https://..." />
          </FormField>
        </div>
      </div>

      <SeoFields
        register={register}
        errors={errors}
        setValue={setValue}
        contentTitle={title ?? ""}
        contentDescription={watch("description") ?? ""}
        contentType="event"
      />

      <div className="flex items-center justify-between">
        <Link href="/admin/events">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Event" : "Update Event"}
        </Button>
      </div>
    </form>
  );
}
