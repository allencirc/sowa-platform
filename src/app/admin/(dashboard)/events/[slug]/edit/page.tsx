"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EventForm } from "@/components/admin/events/EventForm";
import { StatusWorkflow } from "@/components/admin/StatusWorkflow";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { Event } from "@/lib/types";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface EventWithWorkflow extends Event {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const [event, setEvent] = useState<EventWithWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(() => {
    fetch(`/api/events/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Event not found" : "Failed to load");
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const userRole = (session?.user?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  if (loading) return <div className="flex h-64 items-center justify-center text-text-muted">Loading event...</div>;

  if (error || !event) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium text-text-primary">{error ?? "Event not found"}</p>
        <a href="/admin/events" className="text-sm text-accent hover:underline">Back to events</a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit: {event.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">Update this event.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div><EventForm event={event} mode="edit" /></div>
        <div className="space-y-6">
          <StatusWorkflow
            currentStatus={event.status}
            publishAt={event.publishAt}
            rejectionNote={event.rejectionNote}
            contentType="EVENT"
            slug={event.slug}
            userRole={userRole}
            onStatusChange={fetchEvent}
          />
          <VersionHistory
            contentType="EVENT"
            contentId={event.id}
            userRole={userRole}
            onRestore={(snapshot) => {
              setEvent((prev) => prev ? { ...prev, ...snapshot } as EventWithWorkflow : prev);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
