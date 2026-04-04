"use client";

import { ResearchForm } from "@/components/admin/research/ResearchForm";

export default function NewResearchPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add Research</h1>
        <p className="mt-1 text-sm text-text-secondary">Add a new research paper or report.</p>
      </div>
      <ResearchForm mode="create" />
    </div>
  );
}
