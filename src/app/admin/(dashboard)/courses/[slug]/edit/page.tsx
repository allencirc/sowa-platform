"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import { StatusWorkflow } from "@/components/admin/StatusWorkflow";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { Course } from "@/lib/types";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface CourseWithWorkflow extends Course {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [course, setCourse] = useState<CourseWithWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/courses/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Course not found" : "Failed to load");
        return res.json();
      })
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleStatusChange = (newStatus: ContentStatus) => {
    setCourse((prev) =>
      prev ? { ...prev, status: newStatus, rejectionNote: null, publishAt: null } : prev
    );
  };

  const userRole = (session?.user?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  if (loading) return <div className="flex h-64 items-center justify-center text-text-muted">Loading course...</div>;

  if (error || !course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium text-text-primary">{error ?? "Course not found"}</p>
        <a href="/admin/courses" className="text-sm text-accent hover:underline">Back to courses</a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit: {course.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">Update this course.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div><CourseForm course={course} mode="edit" /></div>
        <div className="space-y-6">
          <StatusWorkflow
            currentStatus={course.status}
            publishAt={course.publishAt}
            rejectionNote={course.rejectionNote}
            contentType="COURSE"
            slug={course.slug}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />
          <VersionHistory
            contentType="COURSE"
            contentId={course.id}
            userRole={userRole}
            onRestore={(snapshot) => {
              setCourse((prev) => prev ? { ...prev, ...snapshot } as CourseWithWorkflow : prev);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
