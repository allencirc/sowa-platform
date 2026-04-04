"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cloud,
} from "lucide-react";

interface SyncStatus {
  configured: boolean;
  lastSyncAt: string | null;
  totalSynced: number;
  failedSyncs: number;
  recentErrors: string[];
}

export function HubSpotSyncWidget() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hubspot/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface-card p-6 shadow-sm animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!status) return null;

  const hasErrors = status.failedSyncs > 0;
  const isHealthy = status.configured && !hasErrors;

  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Cloud className="h-5 w-5 text-accent" />
          HubSpot CRM
        </h2>
        <button
          onClick={fetchStatus}
          className="rounded-lg p-2 text-text-muted hover:bg-gray-100 hover:text-text-secondary transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {!status.configured ? (
        <div className="flex items-center gap-2 text-sm text-status-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Not configured. Set <code className="font-mono text-xs bg-gray-100 px-1 rounded">HUBSPOT_API_KEY</code> in
            your environment.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {isHealthy ? (
              <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-status-error shrink-0" />
            )}
            <span className={isHealthy ? "text-secondary" : "text-status-error"}>
              {isHealthy ? "Connected & healthy" : "Connected with errors"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-2xl font-bold text-text-primary">
                {status.totalSynced}
              </p>
              <p className="text-xs text-text-muted">Contacts synced</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p
                className={`text-2xl font-bold ${
                  hasErrors ? "text-status-error" : "text-text-primary"
                }`}
              >
                {status.failedSyncs}
              </p>
              <p className="text-xs text-text-muted">Failed syncs</p>
            </div>
          </div>

          {/* Last sync time */}
          {status.lastSyncAt && (
            <p className="text-xs text-text-muted">
              Last sync:{" "}
              {new Date(status.lastSyncAt).toLocaleString("en-IE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}

          {/* Recent errors */}
          {hasErrors && status.recentErrors.length > 0 && (
            <div>
              <button
                onClick={() => setShowErrors((v) => !v)}
                className="text-xs text-status-error underline hover:no-underline"
              >
                {showErrors ? "Hide errors" : `View ${status.recentErrors.length} recent error(s)`}
              </button>
              {showErrors && (
                <ul className="mt-2 space-y-1 text-xs text-text-secondary bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {status.recentErrors.map((err, i) => (
                    <li key={i} className="font-mono break-all">
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
