"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CareerForm } from "@/components/admin/careers/CareerForm";
import { StatusWorkflow } from "@/components/admin/StatusWorkflow";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { Career } from "@/lib/types";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface CareerWithWorkflow extends Career {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
}

export default function EditCareerPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [career, setCareer] = useState<CareerWithWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareer = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/careers/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Career not found" : "Failed to load");
        return res.json();
      })
      .then((data) => setCareer(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetchCareer();
  }, [fetchCareer]);

  const handleStatusChange = (newStatus: ContentStatus) => {
    // Update local state immediately — avoids a fragile re-fetch
    setCareer((prev) =>
      prev ? { ...prev, status: newStatus, rejectionNote: null, publishAt: null } : prev
    );
  };

  const handleRestore = (snapshot: Record<string, unknown>) => {
    // Navigate to edit with restored data applied
    // For now, reload and the user can manually save
    setCareer((prev) => prev ? { ...prev, ...snapshot } as CareerWithWorkflow : prev);
    router.refresh();
  };

  const userRole = (session?.user?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Loading career...
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium text-text-primary">
          {error ?? "Career not found"}
        </p>
        <a href="/admin/careers" className="text-sm text-accent-dark hover:underline">
          Back to careers
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit: {career.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update this career profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form */}
        <div>
          <CareerForm career={career} mode="edit" />
        </div>

        {/* Sidebar: Status + Version History */}
        <div className="space-y-6">
          <StatusWorkflow
            currentStatus={career.status}
            publishAt={career.publishAt}
            rejectionNote={career.rejectionNote}
            contentType="CAREER"
            slug={career.slug}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />

          <VersionHistory
            contentType="CAREER"
            contentId={career.id}
            userRole={userRole}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </div>
  );
}
