"use client";

import { useState, useCallback } from "react";
import {
  BarChart3,
  Users as UsersIcon,
  Eye,
  Clock,
  Target,
  ExternalLink,
  ClipboardCheck,
  FileBarChart,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { Ga4ReportResult } from "@/lib/integrations/ga4";
import { REPORT_TEMPLATES, type ReportId } from "@/lib/report-templates";
import { DateRangePicker } from "./DateRangePicker";
import { ReportSelector } from "./ReportSelector";
import { ExportButton } from "./ExportButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardProps {
  initialGa4: Ga4ReportResult;
  initialRegistrationsTotal: number;
  initialRegistrationsRange: number;
  initialDays: number;
}

// ---------------------------------------------------------------------------
// Metric card (duplicated from page.tsx, now client-friendly)
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-IE").format(n);
}

function fmtDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnalyticsDashboard({
  initialGa4,
  initialRegistrationsTotal,
  initialRegistrationsRange,
  initialDays,
}: DashboardProps) {
  const [report, setReport] = useState<ReportId>("overview");
  const [ga4, setGa4] = useState(initialGa4);
  const [regsTotal] = useState(initialRegistrationsTotal);
  const [regsRange, setRegsRange] = useState(initialRegistrationsRange);
  const [from, setFrom] = useState(daysAgo(initialDays));
  const [to, setTo] = useState(todayStr());
  const [loading, setLoading] = useState(false);

  // Secondary report data (campaign, content, journey, registration)
  const [reportData, setReportData] = useState<unknown>(null);

  const fetchReport = useCallback(
    async (reportId: ReportId, rangeFrom: string, rangeTo: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          report: reportId,
          from: rangeFrom,
          to: rangeTo,
        });
        const res = await fetch(`/api/admin/analytics?${params}`);
        const data = await res.json();

        if (reportId === "overview") {
          setGa4(data);
          // Also refresh registration counts
          const regParams = new URLSearchParams({
            report: "registration",
            from: rangeFrom,
            to: rangeTo,
          });
          const regRes = await fetch(`/api/admin/analytics?${regParams}`);
          const regData = await regRes.json();
          if (regData.status === "ok") {
            setRegsRange(regData.total ?? 0);
          }
        } else {
          setReportData(data);
        }
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleDateChange = useCallback(
    (range: { from: string; to: string }) => {
      setFrom(range.from);
      setTo(range.to);
      fetchReport(report, range.from, range.to);
    },
    [report, fetchReport],
  );

  const handleReportChange = useCallback(
    (id: ReportId) => {
      setReport(id);
      if (id !== "overview") {
        fetchReport(id, from, to);
      }
    },
    [from, to, fetchReport],
  );

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <DateRangePicker onChange={handleDateChange} defaultDays={initialDays} />
        <ExportButton report={report} from={from} to={to} />
      </div>

      {/* Report tabs */}
      <ReportSelector active={report} onChange={handleReportChange} />

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading report...
        </div>
      )}

      {/* Report description */}
      <p className="text-sm text-text-secondary">{REPORT_TEMPLATES[report].description}</p>

      {/* Report content */}
      {report === "overview" ? (
        <OverviewReport ga4={ga4} regsTotal={regsTotal} regsRange={regsRange} />
      ) : (
        <SecondaryReport report={report} data={reportData} />
      )}

      <p className="text-xs text-text-muted">
        GA4 data refreshed on demand. Registrations sourced from the platform database.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview report (matches original layout)
// ---------------------------------------------------------------------------

function OverviewReport({
  ga4,
  regsTotal,
  regsRange,
}: {
  ga4: Ga4ReportResult;
  regsTotal: number;
  regsRange: number;
}) {
  if (ga4.status === "not_configured") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-base font-semibold text-amber-900">Analytics not configured</h2>
            <p className="mt-1 text-sm text-amber-900/80">{ga4.reason}</p>
          </div>
        </div>
      </div>
    );
  }

  if (ga4.status === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <h2 className="text-base font-semibold text-red-900">Could not load GA4 report</h2>
            <p className="mt-1 break-words text-sm text-red-900/80">{ga4.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const { overview, topPages, topEvents } = ga4.report;

  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Sessions"
            value={fmtNum(overview.sessions)}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Active users"
            value={fmtNum(overview.activeUsers)}
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Page views"
            value={fmtNum(overview.screenPageViews)}
            icon={<Eye className="h-5 w-5" />}
          />
          <MetricCard
            label="Avg. session"
            value={fmtDuration(overview.averageSessionDuration)}
            hint={`Engagement rate ${fmtPct(overview.engagementRate)}`}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Conversions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Diagnostic completions"
            value={fmtNum(ga4.report.diagnosticCompletions)}
            hint={`${fmtNum(ga4.report.diagnosticStarts)} started`}
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="Outbound clicks"
            value={fmtNum(ga4.report.outboundClicks)}
            hint="External + course interest"
            icon={<ExternalLink className="h-5 w-5" />}
          />
          <MetricCard
            label="Registrations (range)"
            value={fmtNum(regsRange)}
            hint={`${fmtNum(regsTotal)} all-time`}
            icon={<ClipboardCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Newsletter signups"
            value={fmtNum(ga4.report.newsletterSignups)}
            icon={<FileBarChart className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-surface-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Top content</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-text-muted">No page views yet.</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {topPages.map((page) => (
                <li key={page.path} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {page.title || page.path}
                    </p>
                    <p className="truncate text-xs text-text-muted">{page.path}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                    {fmtNum(page.views)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl bg-surface-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Top custom events</h2>
          {topEvents.length === 0 ? (
            <p className="text-sm text-text-muted">No events recorded yet.</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {topEvents.slice(0, 10).map((event) => (
                <li key={event.eventName} className="flex items-center justify-between gap-4 py-3">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {event.eventName}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                    {fmtNum(event.count)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Secondary reports (campaign, content, journey, registration)
// ---------------------------------------------------------------------------

function SecondaryReport({ report, data }: { report: ReportId; data: unknown }) {
  if (!data) {
    return <p className="text-sm text-text-muted">Select a date range to load the report.</p>;
  }

  const d = data as Record<string, unknown>;
  if (d.status === "not_configured") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          GA4 is not configured. This report requires GA4 Data API access.
        </p>
      </div>
    );
  }
  if (d.status === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-900">Error: {String(d.message ?? "Unknown error")}</p>
      </div>
    );
  }

  switch (report) {
    case "campaign":
      return <CampaignTable rows={(d.rows ?? []) as Record<string, unknown>[]} />;
    case "content":
      return <ContentTable rows={(d.rows ?? []) as Record<string, unknown>[]} />;
    case "journey":
      return <JourneyView data={(d.data ?? d) as Record<string, unknown>} />;
    case "registration":
      return (
        <RegistrationTable
          rows={(d.rows ?? []) as Record<string, unknown>[]}
          total={(d.total ?? 0) as number}
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Table components for each report
// ---------------------------------------------------------------------------

function CampaignTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <p className="text-sm text-text-muted">No campaign data found.</p>;
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-surface text-left">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Source</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Medium</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Campaign</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Sessions</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Users</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Conversions</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface/50">
              <td className="px-4 py-3 text-text-primary">{String(r.source)}</td>
              <td className="px-4 py-3 text-text-primary">{String(r.medium)}</td>
              <td className="px-4 py-3 text-text-primary">{String(r.campaign)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(Number(r.sessions))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(Number(r.activeUsers))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(Number(r.conversions))}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {fmtPct(Number(r.engagementRate))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return <p className="text-sm text-text-muted">No content data found.</p>;
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-surface text-left">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Page</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Views</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Users</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Avg Duration</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Engagement</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Bounce</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface/50">
              <td className="max-w-xs px-4 py-3">
                <p className="truncate text-text-primary">{String(r.title || r.path)}</p>
                <p className="truncate text-xs text-text-muted">{String(r.path)}</p>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(Number(r.views))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(Number(r.activeUsers))}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {fmtDuration(Number(r.avgDuration))}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {fmtPct(Number(r.engagementRate))}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtPct(Number(r.bounceRate))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JourneyView({ data }: { data: Record<string, unknown> }) {
  const landingPages = (data.landingPages ?? []) as Record<string, unknown>[];
  const funnel = (data.diagnosticFunnel ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Top Landing Pages</h3>
        {landingPages.length === 0 ? (
          <p className="text-sm text-text-muted">No landing page data.</p>
        ) : (
          <ol className="divide-y divide-gray-100">
            {landingPages.slice(0, 15).map((lp, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3">
                <span className="truncate text-sm text-text-primary">{String(lp.landingPage)}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                  {fmtNum(Number(lp.sessions))} sessions
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-xl bg-surface-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Diagnostic Funnel</h3>
        {funnel.length === 0 ? (
          <p className="text-sm text-text-muted">No diagnostic funnel data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium text-text-secondary">Date</th>
                  <th className="px-4 py-2 text-right font-medium text-text-secondary">Starts</th>
                  <th className="px-4 py-2 text-right font-medium text-text-secondary">
                    Completions
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-text-secondary">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {funnel.map((f, i) => {
                  const starts = Number(f.starts);
                  const completions = Number(f.completions);
                  const rate = starts > 0 ? completions / starts : 0;
                  return (
                    <tr key={i}>
                      <td className="px-4 py-2 text-text-primary">{String(f.date)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtNum(starts)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtNum(completions)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtPct(rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RegistrationTable({ rows, total }: { rows: Record<string, unknown>[]; total: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-card p-4 shadow-sm">
        <p className="text-sm text-text-secondary">
          Total registrations in range:{" "}
          <span className="font-semibold text-text-primary">{fmtNum(total)}</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">No registrations found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-surface text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Total</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Confirmed</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Pending</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Cancelled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-surface/50">
                  <td className="px-4 py-3 text-text-primary">{String(r.title)}</td>
                  <td className="px-4 py-3 text-text-secondary">{String(r.type)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {fmtNum(Number(r.total))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-secondary-dark">
                    {fmtNum(Number(r.confirmed))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-600">
                    {fmtNum(Number(r.pending))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-600">
                    {fmtNum(Number(r.cancelled))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
