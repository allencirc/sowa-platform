"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NewsForm } from "@/components/admin/news/NewsForm";
import { StatusWorkflow } from "@/components/admin/StatusWorkflow";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { NewsArticle } from "@/lib/types";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface NewsWithWorkflow extends NewsArticle {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [article, setArticle] = useState<NewsWithWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/news/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Article not found" : "Failed to load");
        return res.json();
      })
      .then((data) => setArticle(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchArticle(); }, [fetchArticle]);

  const handleStatusChange = (newStatus: ContentStatus) => {
    setArticle((prev) =>
      prev ? { ...prev, status: newStatus, rejectionNote: null, publishAt: null } : prev
    );
  };

  const userRole = (session?.user?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  if (loading) return <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>;

  if (error || !article) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium text-text-primary">{error ?? "Article not found"}</p>
        <a href="/admin/news" className="text-sm text-accent-dark hover:underline">Back to news</a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit: {article.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">Update this article.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div><NewsForm article={article} mode="edit" /></div>
        <div className="space-y-6">
          <StatusWorkflow
            currentStatus={article.status}
            publishAt={article.publishAt}
            rejectionNote={article.rejectionNote}
            contentType="NEWS"
            slug={article.slug}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />
          <VersionHistory
            contentType="NEWS"
            contentId={article.id}
            userRole={userRole}
            onRestore={(snapshot) => {
              setArticle((prev) => prev ? { ...prev, ...snapshot } as NewsWithWorkflow : prev);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
