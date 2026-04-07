"use client";

import { Check, Loader2, AlertCircle, Circle } from "lucide-react";

interface AutoSaveIndicatorProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function AutoSaveIndicator({
  saveStatus,
  hasUnsavedChanges,
  lastSavedAt,
  error,
}: AutoSaveIndicatorProps) {
  if (saveStatus === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving...
      </span>
    );
  }

  if (saveStatus === "error" && error) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-status-error">
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed
      </span>
    );
  }

  if (saveStatus === "saved" && !hasUnsavedChanges && lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
        <Check className="h-3.5 w-3.5" />
        Saved {timeAgo(lastSavedAt)}
      </span>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-status-warning">
        <Circle className="h-3 w-3 fill-current" />
        Unsaved changes
      </span>
    );
  }

  return null;
}
