import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAlerts, getUnresolvedAlertCounts } from "@/lib/freshness-check";
import { Badge } from "@/components/ui/Badge";
import { ResolveButton } from "@/components/admin/freshness/ResolveButton";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AlertType, ContentType } from "@/generated/prisma/client";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  CAREER: "Career",
  COURSE: "Course",
  EVENT: "Event",
  RESEARCH: "Research",
  NEWS: "News",
};

const CONTENT_TYPE_COLORS: Record<string, "primary" | "secondary" | "accent" | "info" | "warning"> =
  {
    CAREER: "primary",
    COURSE: "secondary",
    EVENT: "accent",
    RESEARCH: "info",
    NEWS: "warning",
  };

const ALERT_TYPE_LABELS: Record<string, string> = {
  EXPIRED_DATE: "Expired",
  STALE: "Stale",
  OUTDATED: "Outdated",
};

const ALERT_TYPE_STYLES: Record<string, string> = {
  EXPIRED_DATE: "bg-status-error/10 text-status-error",
  STALE: "bg-status-warning/10 text-status-warning",
  OUTDATED: "bg-[#EA580C]/10 text-[#EA580C]",
};

const EDIT_HREF_MAP: Record<string, (slug: string) => string> = {
  CAREER: (slug) => `/admin/careers/${slug}/edit`,
  COURSE: (slug) => `/admin/courses/${slug}/edit`,
  EVENT: (slug) => `/admin/events/${slug}/edit`,
  RESEARCH: (slug) => `/admin/research/${slug}/edit`,
  NEWS: (slug) => `/admin/news/${slug}/edit`,
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    contentType?: string;
    alertType?: string;
    resolved?: string;
  }>;
}

export default async function FreshnessAlertsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const resolved = sp.resolved === "true";
  const contentType = sp.contentType as ContentType | undefined;
  const alertType = sp.alertType as AlertType | undefined;

  const [{ alerts, total }, counts] = await Promise.all([
    getAlerts({ contentType, alertType, resolved, page, limit: 25 }),
    getUnresolvedAlertCounts(),
  ]);

  const totalAlerts = (counts.EXPIRED_DATE ?? 0) + (counts.STALE ?? 0) + (counts.OUTDATED ?? 0);
  const totalPages = Math.ceil(total / 25);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = {
      page: sp.page,
      contentType: sp.contentType,
      alertType: sp.alertType,
      resolved: sp.resolved,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `/admin/freshness-alerts?${params.toString()}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-text-secondary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Content Freshness Alerts</h1>
            <p className="text-sm text-text-secondary">
              {totalAlerts} unresolved alert{totalAlerts !== 1 ? "s" : ""} across all content
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">Type:</label>
          <div className="flex gap-1">
            <Link
              href={buildUrl({ contentType: undefined, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !contentType
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              All
            </Link>
            {(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"] as const).map((ct) => (
              <Link
                key={ct}
                href={buildUrl({ contentType: ct, page: "1" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  contentType === ct
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                {CONTENT_TYPE_LABELS[ct]}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">Alert:</label>
          <div className="flex gap-1">
            <Link
              href={buildUrl({ alertType: undefined, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !alertType
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              All
            </Link>
            {(["EXPIRED_DATE", "STALE", "OUTDATED"] as const).map((at) => (
              <Link
                key={at}
                href={buildUrl({ alertType: at, page: "1" })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  alertType === at
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                {ALERT_TYPE_LABELS[at]}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href={buildUrl({ resolved: resolved ? undefined : "true", page: "1" })}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-gray-200"
        >
          {resolved ? "Hide resolved" : "Show resolved"}
        </Link>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl bg-surface-card shadow-sm">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">
            {resolved ? "No resolved alerts found." : "No unresolved alerts. All content is fresh!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Title</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Alert</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Detected</th>
                  {resolved && (
                    <th className="px-4 py-3 font-medium text-text-secondary">Resolved</th>
                  )}
                  <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Badge variant={CONTENT_TYPE_COLORS[alert.contentType] ?? "default"}>
                        {CONTENT_TYPE_LABELS[alert.contentType] ?? alert.contentType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={EDIT_HREF_MAP[alert.contentType]?.(alert.slug) ?? "#"}
                        className="font-medium text-text-primary hover:text-accent"
                      >
                        {alert.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ALERT_TYPE_STYLES[alert.alertType] ?? ""
                        }`}
                      >
                        {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(new Date(alert.detectedAt).toISOString())}
                    </td>
                    {resolved && (
                      <td className="px-4 py-3 text-text-secondary">
                        {alert.resolvedAt
                          ? formatDate(new Date(alert.resolvedAt).toISOString())
                          : "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {!alert.resolvedAt && <ResolveButton alertId={alert.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-200"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-200"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
