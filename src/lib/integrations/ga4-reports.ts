/**
 * Pre-configured GA4 report fetchers for the admin analytics export and
 * report-template system.
 *
 * Each function runs one or more GA4 Data API calls and returns typed rows.
 * All functions follow the same error-handling pattern as `fetchGa4Overview`.
 */

import { getGa4Config, runReport, type Ga4Config, type RunReportResponse } from "./ga4";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export interface DateRange {
  startDate: string; // "YYYY-MM-DD" or GA4 relative ("7daysAgo")
  endDate: string;
}

type ReportResult<T> =
  | { status: "ok"; rows: T[] }
  | { status: "not_configured"; reason: string }
  | { status: "error"; message: string };

function notConfigured(reason: string): ReportResult<never> {
  return { status: "not_configured", reason };
}

type ConfigError =
  | { status: "not_configured"; reason: string }
  | { status: "error"; message: string };

function getConfigOrFail(): Ga4Config | ConfigError {
  const cfg = getGa4Config();
  if (!cfg.configured) return { status: "not_configured", reason: cfg.reason };
  return cfg;
}

function rowValue(
  row: RunReportResponse["rows"] extends (infer R)[] | undefined ? R : never,
  dimIndex: number,
): string {
  return row?.dimensionValues?.[dimIndex]?.value ?? "";
}

function rowMetric(
  row: RunReportResponse["rows"] extends (infer R)[] | undefined ? R : never,
  metIndex: number,
): number {
  return Number(row?.metricValues?.[metIndex]?.value ?? 0);
}

// ---------------------------------------------------------------------------
// Campaign Performance (UTM breakdown)
// ---------------------------------------------------------------------------

export interface CampaignRow {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  activeUsers: number;
  conversions: number;
  engagementRate: number;
}

export async function fetchCampaignPerformance(
  range: DateRange,
): Promise<ReportResult<CampaignRow>> {
  const cfg = getConfigOrFail();
  if ("status" in cfg) return cfg;

  try {
    const res = await runReport(cfg, {
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
        { name: "sessionCampaignName" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "conversions" },
        { name: "engagementRate" },
      ],
      dateRanges: [range],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 100,
    });

    const rows: CampaignRow[] =
      res.rows?.map((r) => ({
        source: rowValue(r, 0),
        medium: rowValue(r, 1),
        campaign: rowValue(r, 2),
        sessions: rowMetric(r, 0),
        activeUsers: rowMetric(r, 1),
        conversions: rowMetric(r, 2),
        engagementRate: rowMetric(r, 3),
      })) ?? [];

    return { status: "ok", rows };
  } catch (err) {
    return { status: "error", message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Content Performance (page-level engagement)
// ---------------------------------------------------------------------------

export interface ContentRow {
  path: string;
  title: string;
  views: number;
  activeUsers: number;
  avgDuration: number;
  engagementRate: number;
  bounceRate: number;
}

export async function fetchContentPerformance(range: DateRange): Promise<ReportResult<ContentRow>> {
  const cfg = getConfigOrFail();
  if ("status" in cfg) return cfg;

  try {
    const res = await runReport(cfg, {
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "averageSessionDuration" },
        { name: "engagementRate" },
        { name: "bounceRate" },
      ],
      dateRanges: [range],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 50,
    });

    const rows: ContentRow[] =
      res.rows?.map((r) => ({
        path: rowValue(r, 0),
        title: rowValue(r, 1),
        views: rowMetric(r, 0),
        activeUsers: rowMetric(r, 1),
        avgDuration: rowMetric(r, 2),
        engagementRate: rowMetric(r, 3),
        bounceRate: rowMetric(r, 4),
      })) ?? [];

    return { status: "ok", rows };
  } catch (err) {
    return { status: "error", message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// User Journey (landing pages + diagnostic funnel)
// ---------------------------------------------------------------------------

export interface LandingPageRow {
  landingPage: string;
  sessions: number;
  activeUsers: number;
  engagementRate: number;
}

export interface DiagnosticFunnelRow {
  date: string;
  starts: number;
  completions: number;
}

export interface UserJourneyData {
  landingPages: LandingPageRow[];
  diagnosticFunnel: DiagnosticFunnelRow[];
}

export async function fetchUserJourney(
  range: DateRange,
): Promise<ConfigError | { status: "ok"; data: UserJourneyData }> {
  const cfg = getConfigOrFail();
  if ("status" in cfg) return cfg;

  try {
    const [landingRes, funnelStartsRes, funnelCompletionsRes] = await Promise.all([
      runReport(cfg, {
        dimensions: [{ name: "landingPage" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagementRate" }],
        dateRanges: [range],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
      }),
      runReport(cfg, {
        dimensions: [{ name: "date" }],
        metrics: [{ name: "eventCount" }],
        dateRanges: [range],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "diagnostic_started" },
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),
      runReport(cfg, {
        dimensions: [{ name: "date" }],
        metrics: [{ name: "eventCount" }],
        dateRanges: [range],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "diagnostic_completed" },
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),
    ]);

    const landingPages: LandingPageRow[] =
      landingRes.rows?.map((r) => ({
        landingPage: rowValue(r, 0),
        sessions: rowMetric(r, 0),
        activeUsers: rowMetric(r, 1),
        engagementRate: rowMetric(r, 2),
      })) ?? [];

    // Merge starts and completions by date
    const startsMap = new Map(
      funnelStartsRes.rows?.map((r) => [rowValue(r, 0), rowMetric(r, 0)]) ?? [],
    );
    const completionsMap = new Map(
      funnelCompletionsRes.rows?.map((r) => [rowValue(r, 0), rowMetric(r, 0)]) ?? [],
    );
    const allDates = new Set([...startsMap.keys(), ...completionsMap.keys()]);
    const diagnosticFunnel: DiagnosticFunnelRow[] = [...allDates].sort().map((date) => ({
      date,
      starts: startsMap.get(date) ?? 0,
      completions: completionsMap.get(date) ?? 0,
    }));

    return { status: "ok", data: { landingPages, diagnosticFunnel } };
  } catch (err) {
    return { status: "error", message: (err as Error).message };
  }
}
