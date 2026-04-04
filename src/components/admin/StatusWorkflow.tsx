"use client";

import { useState } from "react";
import {
  FileEdit,
  Eye,
  CheckCircle2,
  Archive,
  ArrowRight,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface StatusWorkflowProps {
  currentStatus: ContentStatus;
  publishAt: string | null;
  rejectionNote: string | null;
  contentType: string;
  slug: string;
  userRole: "ADMIN" | "EDITOR" | "VIEWER";
  onStatusChange?: (newStatus: ContentStatus) => void;
}

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; icon: typeof FileEdit; color: string; bgColor: string }
> = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  PUBLISHED: {
    label: "Published",
    icon: CheckCircle2,
    color: "text-secondary",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    color: "text-gray-500",
    bgColor: "bg-gray-50 border-gray-200",
  },
};

const TRANSITIONS: Record<string, Record<ContentStatus, ContentStatus[]>> = {
  EDITOR: {
    DRAFT: ["IN_REVIEW"],
    IN_REVIEW: [],
    PUBLISHED: [],
    ARCHIVED: [],
  },
  ADMIN: {
    DRAFT: ["IN_REVIEW", "PUBLISHED"],
    IN_REVIEW: ["PUBLISHED", "DRAFT"],
    PUBLISHED: ["ARCHIVED", "DRAFT"],
    ARCHIVED: ["DRAFT"],
  },
};

export function StatusWorkflow({
  currentStatus,
  publishAt,
  rejectionNote,
  contentType,
  slug,
  userRole,
  onStatusChange,
}: StatusWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const config = STATUS_CONFIG[currentStatus];
  const Icon = config.icon;
  const availableTransitions = TRANSITIONS[userRole]?.[currentStatus] ?? [];

  const handleTransition = async (newStatus: ContentStatus) => {
    // If rejecting, show input first
    if (currentStatus === "IN_REVIEW" && newStatus === "DRAFT" && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }

    // If publishing with schedule, show date picker
    if (newStatus === "PUBLISHED" && showSchedule && !scheduleDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/content-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          slug,
          newStatus,
          rejectionNote: newStatus === "DRAFT" && currentStatus === "IN_REVIEW" ? rejectNote : null,
          publishAt: newStatus === "PUBLISHED" && scheduleDate ? new Date(scheduleDate).toISOString() : null,
          changeNote: `Status: ${currentStatus} → ${newStatus}`,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update status");
      }

      setShowRejectInput(false);
      setRejectNote("");
      setShowSchedule(false);
      setScheduleDate("");
      onStatusChange?.(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (status: ContentStatus) => {
    switch (status) {
      case "IN_REVIEW":
        return "Submit for Review";
      case "PUBLISHED":
        return "Approve & Publish";
      case "DRAFT":
        return currentStatus === "IN_REVIEW" ? "Reject" : "Unpublish";
      case "ARCHIVED":
        return "Archive";
    }
  };

  const getActionVariant = (status: ContentStatus) => {
    if (status === "PUBLISHED") return "primary" as const;
    if (status === "DRAFT" && currentStatus === "IN_REVIEW") return "outline" as const;
    return "outline" as const;
  };

  const getActionIcon = (status: ContentStatus) => {
    switch (status) {
      case "IN_REVIEW":
        return Send;
      case "PUBLISHED":
        return CheckCircle2;
      case "DRAFT":
        return AlertCircle;
      case "ARCHIVED":
        return Archive;
    }
  };

  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Publishing Status
      </h2>

      {/* Current status display */}
      <div
        className={cn(
          "mb-4 flex items-center gap-3 rounded-lg border px-4 py-3",
          config.bgColor
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
        <div>
          <p className={cn("text-sm font-semibold", config.color)}>
            {config.label}
          </p>
          {publishAt && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="h-3 w-3" />
              Scheduled: {new Date(publishAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Rejection note banner */}
      {rejectionNote && currentStatus === "DRAFT" && (
        <div className="mb-4 rounded-lg border border-status-error/20 bg-status-error/5 px-4 py-3">
          <p className="text-xs font-medium text-status-error">Rejection Note</p>
          <p className="mt-1 text-sm text-text-primary">{rejectionNote}</p>
        </div>
      )}

      {/* Status flow visualization */}
      <div className="mb-4 flex items-center justify-between gap-1 rounded-lg bg-gray-50 px-3 py-2">
        {(["DRAFT", "IN_REVIEW", "PUBLISHED"] as ContentStatus[]).map(
          (status, i) => {
            const stepConfig = STATUS_CONFIG[status];
            const StepIcon = stepConfig.icon;
            const isActive = currentStatus === status;
            const isPast =
              (["DRAFT", "IN_REVIEW", "PUBLISHED"] as ContentStatus[]).indexOf(
                currentStatus
              ) > i;

            return (
              <div key={status} className="flex items-center gap-1">
                {i > 0 && (
                  <ArrowRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isPast ? "text-secondary" : "text-gray-300"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
                    isActive
                      ? stepConfig.bgColor + " " + stepConfig.color
                      : isPast
                        ? "text-secondary"
                        : "text-gray-400"
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{stepConfig.label}</span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Rejection note input */}
      {showRejectInput && (
        <div className="mb-4 space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Rejection Note <span className="text-status-error">*</span>
          </label>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain why this content is being rejected..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowRejectInput(false);
                setRejectNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!rejectNote.trim() || loading}
              onClick={() => handleTransition("DRAFT")}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}

      {/* Schedule publishing */}
      {showSchedule && (
        <div className="mb-4 space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Schedule Publish Date
          </label>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowSchedule(false);
                setScheduleDate("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!scheduleDate || loading}
              onClick={() => handleTransition("PUBLISHED")}
            >
              <Clock className="h-3.5 w-3.5" />
              Schedule
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {availableTransitions.length > 0 && !showRejectInput && !showSchedule && (
        <div className="flex flex-wrap gap-2">
          {availableTransitions.map((targetStatus) => {
            const ActionIcon = getActionIcon(targetStatus);
            return (
              <Button
                key={targetStatus}
                variant={getActionVariant(targetStatus)}
                size="sm"
                disabled={loading}
                onClick={() => handleTransition(targetStatus)}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                {loading ? "Processing..." : getActionLabel(targetStatus)}
              </Button>
            );
          })}

          {/* Schedule button for admins when content can be published */}
          {userRole === "ADMIN" &&
            availableTransitions.includes("PUBLISHED") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSchedule(true)}
              >
                <Clock className="h-3.5 w-3.5" />
                Schedule
              </Button>
            )}
        </div>
      )}

      {availableTransitions.length === 0 && !showRejectInput && (
        <p className="text-xs text-text-muted">
          {userRole === "VIEWER"
            ? "You don't have permission to change the status."
            : "No status transitions available from this state."}
        </p>
      )}
    </div>
  );
}
