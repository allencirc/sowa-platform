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
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGa4Overview, type Ga4ReportResult } from "@/lib/integrations/ga4";

// Revalidate the admin analytics view every 5 minutes. GA4 reports are
// expensive to fetch on every request and the dashboard doesn't need
// sub-minute freshness.
export const revalidate = 300;

export const metadata = {
  title: "Analytics — SOWA Admin",
  description:
    "Site traffic, top content, diagnostic completions, and conversion events from Google Analytics 4.",
};

// ---------------------------------------------------------------------------
// Small presentational helpers (kept local — not reused elsewhere)
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

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IE").format(n);
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Fallback states
// ---------------------------------------------------------------------------

function LookerStudioFallback({ url }: { url: string }) {
  return (
    <div className="rounded-xl bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Embedded Looker Studio report (read-only)
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-dark"
        >
          Open in new tab <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-gray-100">
        <iframe
          src={url}
          title="SOWA Analytics — Looker Studio"
          className="h-full w-full"
          frameBorder={0}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

function NotConfiguredPanel({ reason }: { reason: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h2 className="text-base font-semibold text-amber-900">
            Analytics not configured
          </h2>
          <p className="mt-1 text-sm text-amber-900/80">{reason}</p>
          <p className="mt-3 text-sm text-amber-900/80">
            Configure either of the following to enable this page:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/80">
            <li>
              <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">
                GA4_PROPERTY_ID
              </code>{" "}
              +{" "}
              <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">
                GA4_SERVICE_ACCOUNT_JSON
              </code>{" "}
              — live data via the GA4 Data API
            </li>
            <li>
              <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">
                GA4_LOOKER_STUDIO_URL
              </code>{" "}
              — read-only embedded dashboard (demo fallback)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Pull GA4 report + local registration counts in parallel. Registrations
  // live in Postgres, so they're authoritative for "signed up for an event /
  // course" conversions and complement the GA4 page/event metrics.
  const [ga4, registrationsTotal, registrationsLast28] = await Promise.all([
    fetchGa4Overview(28),
    prisma.registration.count(),
    prisma.registration.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
            <BarChart3 className="h-6 w-6 text-secondary-dark" />
            Analytics
          </h1>
          <p className="mt-1 text-text-secondary">
            Site traffic, top content, diagnostic completions, and conversion
            events. Last 28 days.
          </p>
        </div>
      </div>

      <AnalyticsBody
        ga4={ga4}
        registrationsTotal={registrationsTotal}
        registrationsLast28={registrationsLast28}
      />
    </div>
  );
}

function AnalyticsBody({
  ga4,
  registrationsTotal,
  registrationsLast28,
}: {
  ga4: Ga4ReportResult;
  registrationsTotal: number;
  registrationsLast28: number;
}) {
  // --- No GA4 credentials: try Looker Studio iframe, else show config hint -
  if (ga4.status === "not_configured") {
    return (
      <div className="space-y-6">
        {ga4.lookerStudioUrl ? (
          <LookerStudioFallback url={ga4.lookerStudioUrl} />
        ) : (
          <NotConfiguredPanel reason={ga4.reason} />
        )}
        <LocalConversions
          total={registrationsTotal}
          last28={registrationsLast28}
        />
      </div>
    );
  }

  // --- GA4 configured but the call failed: surface error + optional iframe -
  if (ga4.status === "error") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h2 className="text-base font-semibold text-red-900">
                Could not load GA4 report
              </h2>
              <p className="mt-1 break-words text-sm text-red-900/80">
                {ga4.message}
              </p>
            </div>
          </div>
        </div>
        {ga4.lookerStudioUrl ? (
          <LookerStudioFallback url={ga4.lookerStudioUrl} />
        ) : null}
        <LocalConversions
          total={registrationsTotal}
          last28={registrationsLast28}
        />
      </div>
    );
  }

  // --- Happy path: full GA4 dashboard ----------------------------------------
  const { overview, topPages, topEvents } = ga4.report;

  return (
    <div className="space-y-8">
      {/* Top-line metrics */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Sessions"
            value={formatNumber(overview.sessions)}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Active users"
            value={formatNumber(overview.activeUsers)}
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Page views"
            value={formatNumber(overview.screenPageViews)}
            icon={<Eye className="h-5 w-5" />}
          />
          <MetricCard
            label="Avg. session"
            value={formatDuration(overview.averageSessionDuration)}
            hint={`Engagement rate ${formatPercent(overview.engagementRate)}`}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Conversion events */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">
          Conversions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Diagnostic completions"
            value={formatNumber(ga4.report.diagnosticCompletions)}
            hint={`${formatNumber(ga4.report.diagnosticStarts)} started`}
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="Outbound clicks"
            value={formatNumber(ga4.report.outboundClicks)}
            hint="External + course interest"
            icon={<ExternalLink className="h-5 w-5" />}
          />
          <MetricCard
            label="Registrations (28d)"
            value={formatNumber(registrationsLast28)}
            hint={`${formatNumber(registrationsTotal)} all-time`}
            icon={<ClipboardCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Newsletter signups"
            value={formatNumber(ga4.report.newsletterSignups)}
            icon={<FileBarChart className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Top content + top events side-by-side */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-surface-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Top content
          </h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-text-muted">No page views yet.</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {topPages.map((page) => (
                <li
                  key={page.path}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {page.title || page.path}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {page.path}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                    {formatNumber(page.views)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl bg-surface-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Top custom events
          </h2>
          {topEvents.length === 0 ? (
            <p className="text-sm text-text-muted">No events recorded yet.</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {topEvents.slice(0, 10).map((event) => (
                <li
                  key={event.eventName}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-text-primary">
                    {event.eventName}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
                    {formatNumber(event.count)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <p className="text-xs text-text-muted">
        GA4 data refreshed every 5 minutes. Registrations sourced from the
        platform database.
      </p>
    </div>
  );
}

function LocalConversions({
  total,
  last28,
}: {
  total: number;
  last28: number;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text-primary">
        Registrations (from platform database)
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Registrations — last 28 days"
          value={formatNumber(last28)}
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Registrations — all time"
          value={formatNumber(total)}
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
      </div>
    </section>
  );
}
