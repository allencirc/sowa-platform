"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ConsentPreferences,
  getConsentPreferences,
  setConsentPreferences,
  initAnalytics,
} from "@/lib/analytics";
import { loadMarketingPixels } from "@/lib/marketing-pixels";

type View = "banner" | "preferences" | "hidden";

export function CookieConsent() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Show banner only when no consent cookie exists yet
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const existing = getConsentPreferences();
    if (!existing) {
      setView("banner");
    } else {
      // Already consented — boot scripts matching their choices
      if (existing.analytics) initAnalytics();
      if (existing.marketing) loadMarketingPixels();
    }
  }, []);

  const save = useCallback((prefs: Pick<ConsentPreferences, "analytics" | "marketing">) => {
    const full: ConsentPreferences = {
      ...prefs,
      timestamp: new Date().toISOString(),
    };
    setConsentPreferences(full);
    setView("hidden");

    // Boot allowed scripts immediately
    if (full.analytics) initAnalytics();
    if (full.marketing) loadMarketingPixels();
  }, []);

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });
  const savePreferences = () => save({ analytics, marketing });

  if (view === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-primary shadow-2xl">
        {/* ── Banner view ─────────────────────────────────────── */}
        {view === "banner" && (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 hidden size-6 shrink-0 text-secondary-dark sm:block" />
              <div className="flex-1 space-y-3">
                <p className="text-sm leading-relaxed text-text-inverse">
                  We use cookies to understand how you use SOWA and improve your experience.
                  Analytics cookies help us measure usage; marketing cookies let us reach you on
                  other platforms. You can change your preferences at any time.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={acceptAll}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={rejectAll}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setView("preferences")}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    <Settings className="size-4" />
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Preferences view ────────────────────────────────── */}
        {view === "preferences" && (
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-inverse">Cookie Preferences</h2>
              <button
                onClick={() => setView("banner")}
                aria-label="Back to banner"
                className="rounded-lg p-1.5 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Strictly necessary — always on */}
              <ToggleRow
                label="Strictly Necessary"
                description="Required for the site to function. Cannot be disabled."
                checked
                disabled
              />

              {/* Analytics */}
              <ToggleRow
                label="Analytics"
                description="Help us understand how visitors use the site so we can improve it (Google Analytics 4)."
                checked={analytics}
                onChange={setAnalytics}
              />

              {/* Marketing */}
              <ToggleRow
                label="Marketing"
                description="Allow us to measure campaign effectiveness on platforms like Meta and LinkedIn."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={savePreferences}
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle row sub-component
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const id = `cookie-toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium",
            disabled ? "text-white/50" : "text-text-inverse",
          )}
        >
          {label}
        </label>
        <p className="mt-0.5 text-xs leading-relaxed text-white/50">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
          checked ? "bg-secondary" : "bg-white/20",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
