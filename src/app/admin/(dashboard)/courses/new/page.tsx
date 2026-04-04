"use client";

import { CourseForm } from "@/components/admin/courses/CourseForm";

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add Course</h1>
        <p className="mt-1 text-sm text-text-secondary">Create a new training course.</p>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}
