"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ResearchForm } from "@/components/admin/research/ResearchForm";
import { StatusWorkflow } from "@/components/admin/StatusWorkflow";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { Research } from "@/lib/types";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface ResearchWithWorkflow extends Research {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
}

export default function EditResearchPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [research, setResearch] = useState<ResearchWithWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/research/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Research not found" : "Failed to load");
        return res.json();
      })
      .then((data) => setResearch(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const handleStatusChange = (newStatus: ContentStatus) => {
    setResearch((prev) =>
      prev ? { ...prev, status: newStatus, rejectionNote: null, publishAt: null } : prev,
    );
  };

  const userRole = (session?.user?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  if (loading)
    return <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>;

  if (error || !research) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium text-text-primary">{error ?? "Research not found"}</p>
        <Link href="/admin/research" className="text-sm text-accent-dark hover:underline">
          Back to research
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit: {research.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">Update this research item.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ResearchForm research={research} mode="edit" />
        </div>
        <div className="space-y-6">
          <StatusWorkflow
            currentStatus={research.status}
            publishAt={research.publishAt}
            rejectionNote={research.rejectionNote}
            contentType="RESEARCH"
            slug={research.slug}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />
          <VersionHistory
            contentType="RESEARCH"
            contentId={research.id}
            userRole={userRole}
            onRestore={(snapshot) => {
              setResearch((prev) =>
                prev ? ({ ...prev, ...snapshot } as ResearchWithWorkflow) : prev,
              );
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
