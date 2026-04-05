import { AlertTriangle } from "lucide-react";
import { isReadOnly, READ_ONLY_MESSAGE } from "@/lib/read-only";

/**
 * Visible notice shown at the top of the admin dashboard when the platform
 * is running in disaster-recovery read-only mode. Renders nothing when the
 * flag is off, so it is safe to include unconditionally in the layout.
 */
export function ReadOnlyBanner() {
  if (!isReadOnly()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 border-b border-status-warning/40 bg-status-warning/10 px-6 py-3 text-sm text-primary"
      data-testid="read-only-banner"
    >
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-status-warning"
      />
      <div>
        <p className="font-semibold">Read-only mode</p>
        <p className="text-text-secondary">{READ_ONLY_MESSAGE}</p>
      </div>
    </div>
  );
}
