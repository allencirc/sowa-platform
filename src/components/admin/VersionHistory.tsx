"use client";

import { useCallback, useEffect, useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  User,
  Clock,
  GitCommitHorizontal,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DiffViewer } from "./DiffViewer";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  version: number;
  snapshot: Record<string, unknown>;
  changeNote: string | null;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  changedAt: string;
}

interface VersionHistoryProps {
  contentType: string;
  contentId: string;
  onRestore?: (snapshot: Record<string, unknown>) => void;
  userRole: "ADMIN" | "EDITOR" | "VIEWER";
  onVersionRestored?: () => void;
}

export function VersionHistory({
  contentType,
  contentId,
  onRestore,
  userRole,
  onVersionRestored,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [showDiff, setShowDiff] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<Version | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!contentId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        contentType,
        contentId,
        page: String(page),
        limit: "10",
      });
      const res = await fetch(`/api/versions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      const data = await res.json();
      setVersions(data.versions);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching versions:", err);
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId, page]);

  useEffect(() => {
    if (expanded) {
      fetchVersions();
    }
  }, [expanded, fetchVersions]);

  const handleRestore = async (version: Version) => {
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/versions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: version.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Failed to restore version:", body.error);
        return;
      }

      // Refresh version list
      fetchVersions();

      // Notify parent to refresh its data
      if (onRestore) onRestore(version.snapshot);
      if (onVersionRestored) onVersionRestored();
    } finally {
      setRestoring(false);
      setConfirmRestore(null);
    }
  };

  const handleCompare = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev[0] === null) return [versionId, null];
      if (prev[0] === versionId) return [null, null];
      if (prev[1] === versionId) return [prev[0], null];
      return [prev[0], versionId];
    });
  };

  const compareVersions = versions.filter((v) => selectedVersions.includes(v.id));

  const canCompare = selectedVersions[0] !== null && selectedVersions[1] !== null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl bg-surface-card shadow-sm">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-text-secondary" />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Version History</h2>
            {total > 0 && (
              <p className="text-xs text-text-muted">
                {total} version{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 pb-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-text-muted">
              Loading version history...
            </div>
          ) : versions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-text-muted">
              No version history yet. Versions are created on each save.
            </div>
          ) : (
            <>
              {/* Compare toolbar */}
              {(selectedVersions[0] || selectedVersions[1]) && (
                <div className="my-3 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                  <span className="text-xs text-text-secondary">
                    {canCompare ? "2 versions selected" : "Select 1 more version to compare"}
                  </span>
                  <div className="flex-1" />
                  {canCompare && (
                    <Button size="sm" variant="outline" onClick={() => setShowDiff(true)}>
                      Compare
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedVersions([null, null])}
                  >
                    Clear
                  </Button>
                </div>
              )}

              {/* Version list */}
              <div className="mt-3 space-y-1">
                {versions.map((version, index) => {
                  const isSelected = selectedVersions.includes(version.id);
                  const isLatest = index === 0 && page === 1;

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        "group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                        isSelected
                          ? "border-accent/30 bg-accent/5"
                          : "border-transparent hover:bg-gray-50",
                      )}
                    >
                      {/* Timeline dot */}
                      <div className="mt-1.5 flex flex-col items-center">
                        <div
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            isLatest ? "bg-secondary" : "bg-gray-300",
                          )}
                        />
                        {index < versions.length - 1 && (
                          <div className="mt-0.5 h-8 w-px bg-gray-200" />
                        )}
                      </div>

                      {/* Version info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-semibold text-text-primary">
                            <GitCommitHorizontal className="h-3 w-3" />v{version.version}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary-dark">
                              Current
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-text-muted">
                            <Clock className="h-3 w-3" />
                            {formatDate(version.changedAt)}
                          </span>
                        </div>

                        {version.changeNote && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                            <MessageSquare className="h-3 w-3 shrink-0" />
                            {version.changeNote}
                          </p>
                        )}

                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-text-muted">
                          <User className="h-3 w-3" />
                          {version.changedBy.name}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleCompare(version.id)}
                          className={cn(
                            "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                            isSelected
                              ? "bg-accent text-white"
                              : "bg-gray-100 text-text-secondary hover:bg-gray-200",
                          )}
                        >
                          {isSelected ? "Selected" : "Compare"}
                        </button>

                        {!isLatest && (userRole === "ADMIN" || userRole === "EDITOR") && (
                          <button
                            type="button"
                            onClick={() => setConfirmRestore(version)}
                            disabled={restoring}
                            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-amber-50 hover:text-amber-700"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {total > 10 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-text-muted">
                    Page {page} of {Math.ceil(total / 10)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page >= Math.ceil(total / 10)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Restore confirmation modal */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary">Restore Version?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              This will revert to version {confirmRestore.version} from{" "}
              {new Date(confirmRestore.changedAt).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              . A new version will be created so you can undo this.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmRestore(null)}
                disabled={restoring}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestore(confirmRestore)}
                disabled={restoring}
                className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                {restoring ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff modal */}
      {showDiff && canCompare && compareVersions.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-text-primary">Compare Versions</h3>
              <button
                type="button"
                onClick={() => {
                  setShowDiff(false);
                  setSelectedVersions([null, null]);
                }}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 73px)" }}>
              <DiffViewer
                oldData={
                  compareVersions[0].version < compareVersions[1].version
                    ? compareVersions[0].snapshot
                    : compareVersions[1].snapshot
                }
                newData={
                  compareVersions[0].version < compareVersions[1].version
                    ? compareVersions[1].snapshot
                    : compareVersions[0].snapshot
                }
                oldLabel={`v${Math.min(compareVersions[0].version, compareVersions[1].version)}`}
                newLabel={`v${Math.max(compareVersions[0].version, compareVersions[1].version)}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
