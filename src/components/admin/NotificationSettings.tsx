"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Preference {
  event: string;
  enabled: boolean;
}

const EVENT_LABELS: Record<string, { label: string; description: string }> = {
  CONTENT_SUBMITTED: {
    label: "Content submitted for review",
    description: "Receive an email when an editor submits content for review",
  },
  CONTENT_APPROVED: {
    label: "Content approved",
    description: "Receive an email when your content is approved by an admin",
  },
  CONTENT_REJECTED: {
    label: "Content returned for changes",
    description: "Receive an email when your content is returned with feedback",
  },
  CONTENT_PUBLISHED: {
    label: "Content published",
    description: "Receive an email when your content goes live on the platform",
  },
};

// ADMIN sees all; EDITOR only sees events relevant to their authored content
const EVENTS_BY_ROLE: Record<string, string[]> = {
  ADMIN: ["CONTENT_SUBMITTED", "CONTENT_APPROVED", "CONTENT_REJECTED", "CONTENT_PUBLISHED"],
  EDITOR: ["CONTENT_APPROVED", "CONTENT_REJECTED", "CONTENT_PUBLISHED"],
};

export function NotificationSettings() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const role = (session?.user?.role as string) ?? "EDITOR";
  const visibleEvents = EVENTS_BY_ROLE[role] ?? EVENTS_BY_ROLE.EDITOR;

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch {
      console.error("Failed to fetch notification preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  async function togglePreference(event: string, currentEnabled: boolean) {
    const newEnabled = !currentEnabled;

    // Optimistic update
    setPreferences((prev) =>
      prev.map((p) => (p.event === event ? { ...p, enabled: newEnabled } : p)),
    );
    setUpdating(event);

    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, enabled: newEnabled }),
      });

      if (!res.ok) {
        // Revert on failure
        setPreferences((prev) =>
          prev.map((p) => (p.event === event ? { ...p, enabled: currentEnabled } : p)),
        );
      }
    } catch {
      // Revert on failure
      setPreferences((prev) =>
        prev.map((p) => (p.event === event ? { ...p, enabled: currentEnabled } : p)),
      );
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  const visiblePrefs = preferences.filter((p) => visibleEvents.includes(p.event));

  return (
    <div className="space-y-3">
      {visiblePrefs.map((pref) => {
        const meta = EVENT_LABELS[pref.event];
        if (!meta) return null;

        return (
          <div
            key={pref.event}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-surface p-4"
          >
            <div className="mr-4">
              <p className="text-sm font-medium text-text-primary">{meta.label}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{meta.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pref.enabled}
              aria-label={`Toggle ${meta.label}`}
              disabled={updating === pref.event}
              onClick={() => togglePreference(pref.event, pref.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
                pref.enabled ? "bg-secondary" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  pref.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      })}

      {visiblePrefs.length === 0 && (
        <p className="text-sm text-text-secondary">No notification settings available.</p>
      )}
    </div>
  );
}
