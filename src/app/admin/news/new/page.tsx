"use client";

import { NewsForm } from "@/components/admin/news/NewsForm";

export default function NewNewsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add News Article</h1>
        <p className="mt-1 text-sm text-text-secondary">Publish a new news article.</p>
      </div>
      <NewsForm mode="create" />
    </div>
  );
}
