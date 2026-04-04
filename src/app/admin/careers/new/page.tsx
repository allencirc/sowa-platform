"use client";

import { CareerForm } from "@/components/admin/careers/CareerForm";

export default function NewCareerPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add Career Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Create a new career pathway for the SOWA platform.
        </p>
      </div>
      <CareerForm mode="create" />
    </div>
  );
}
