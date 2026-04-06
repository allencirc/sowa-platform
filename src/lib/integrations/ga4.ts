/**
 * GA4 Data API (v1beta) — server-side client.
 *
 * Used by the admin analytics page to pull sessions, top pages, custom events
 * and conversions directly from Google Analytics using a service-account JWT.
 *
 * No external dependencies: we sign the JWT with Node's `crypto` module and
 * call both the OAuth token endpoint and the Data API over `fetch`.
 *
 * Required env vars:
 *   GA4_PROPERTY_ID            e.g. "properties/123456789" or just "123456789"
 *   GA4_SERVICE_ACCOUNT_JSON   stringified service-account JSON key (with
 *                              `client_email` and `private_key` fields). The
 *                              service account must be granted "Viewer" on the
 *                              GA4 property.
 *
 * Optional env var:
 *   GA4_LOOKER_STUDIO_URL      public Looker Studio report URL. If set, the
 *                              admin page falls back to an iframe when the
 *                              Data API credentials are not configured.
 *
 * If credentials are missing or any call fails, functions return a typed
 * "not configured" / "error" state so the UI can degrade gracefully rather
 * than crash the admin dashboard.
 */

import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Config / env access
// ---------------------------------------------------------------------------

export interface Ga4Config {
  configured: true;
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

export interface Ga4NotConfigured {
  configured: false;
  lookerStudioUrl: string | null;
  reason: string;
}

export function getGa4Config(): Ga4Config | Ga4NotConfigured {
  const propertyIdRaw = process.env.GA4_PROPERTY_ID;
  const saRaw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  const lookerStudioUrl = process.env.GA4_LOOKER_STUDIO_URL ?? null;

  if (!propertyIdRaw || !saRaw) {
    return {
      configured: false,
      lookerStudioUrl,
      reason:
        "GA4_PROPERTY_ID and/or GA4_SERVICE_ACCOUNT_JSON are not set. Configure the service account or GA4_LOOKER_STUDIO_URL to enable analytics.",
    };
  }

  try {
    const sa = JSON.parse(saRaw) as { client_email?: string; private_key?: string };
    if (!sa.client_email || !sa.private_key) {
      return {
        configured: false,
        lookerStudioUrl,
        reason: "GA4_SERVICE_ACCOUNT_JSON is missing client_email or private_key.",
      };
    }
    return {
      configured: true,
      propertyId: propertyIdRaw.startsWith("properties/")
        ? propertyIdRaw
        : `properties/${propertyIdRaw}`,
      clientEmail: sa.client_email,
      // Support both real newlines and the common "\n"-escaped form used in .env files.
      privateKey: sa.private_key.replace(/\\n/g, "\n"),
    };
  } catch (err) {
    return {
      configured: false,
      lookerStudioUrl,
      reason: `GA4_SERVICE_ACCOUNT_JSON is not valid JSON: ${(err as Error).message}`,
    };
  }
}

// ---------------------------------------------------------------------------
// OAuth: sign a JWT, exchange for an access token, cache in-memory per process
// ---------------------------------------------------------------------------

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
let cachedToken: CachedToken | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(cfg: Ga4Config): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const iat = Math.floor(now / 1000);
  const exp = iat + 3600;
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: cfg.clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(cfg.privateKey);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GA4 token exchange failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return json.access_token;
}

// ---------------------------------------------------------------------------
// Data API types (minimal — only what the admin page consumes)
// ---------------------------------------------------------------------------

interface RunReportRequest {
  dimensions?: { name: string }[];
  metrics: { name: string }[];
  dateRanges: { startDate: string; endDate: string }[];
  orderBys?: {
    metric?: { metricName: string };
    dimension?: { dimensionName: string };
    desc?: boolean;
  }[];
  limit?: number;
  dimensionFilter?: unknown;
}

interface RunReportResponse {
  dimensionHeaders?: { name: string }[];
  metricHeaders?: { name: string }[];
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
  rowCount?: number;
}

async function runReport(cfg: Ga4Config, body: RunReportRequest): Promise<RunReportResponse> {
  const token = await getAccessToken(cfg);
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${cfg.propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Revalidate every 5 minutes — the admin page is already wrapped in a
      // `revalidate` export, this is just a safety net.
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) {
    throw new Error(`GA4 runReport failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as RunReportResponse;
}

// ---------------------------------------------------------------------------
// High-level report shape consumed by the admin page
// ---------------------------------------------------------------------------

export interface Ga4OverviewMetrics {
  sessions: number;
  activeUsers: number;
  screenPageViews: number;
  averageSessionDuration: number; // seconds
  engagementRate: number; // 0..1
}

export interface Ga4TopPage {
  path: string;
  title: string;
  views: number;
}

export interface Ga4EventRow {
  eventName: string;
  count: number;
}

export interface Ga4Report {
  dateRange: { startDate: string; endDate: string };
  overview: Ga4OverviewMetrics;
  topPages: Ga4TopPage[];
  diagnosticCompletions: number;
  diagnosticStarts: number;
  newsletterSignups: number;
  outboundClicks: number;
  topEvents: Ga4EventRow[];
}

export type Ga4ReportResult =
  | { status: "ok"; report: Ga4Report }
  | { status: "not_configured"; lookerStudioUrl: string | null; reason: string }
  | { status: "error"; message: string; lookerStudioUrl: string | null };

/**
 * Pull the admin-analytics overview in a single call batch. Designed for the
 * `/admin/analytics` page: sessions + top content + custom event counts.
 */
export async function fetchGa4Overview(days = 28): Promise<Ga4ReportResult> {
  const cfg = getGa4Config();
  if (!cfg.configured) {
    return {
      status: "not_configured",
      lookerStudioUrl: cfg.lookerStudioUrl,
      reason: cfg.reason,
    };
  }

  const lookerStudioUrl = process.env.GA4_LOOKER_STUDIO_URL ?? null;
  const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

  try {
    const [overviewRes, topPagesRes, eventsRes] = await Promise.all([
      runReport(cfg, {
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
        ],
        dateRanges: [dateRange],
      }),
      runReport(cfg, {
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        dateRanges: [dateRange],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      runReport(cfg, {
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dateRanges: [dateRange],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 25,
      }),
    ]);

    const overviewRow = overviewRes.rows?.[0]?.metricValues ?? [];
    const overview: Ga4OverviewMetrics = {
      sessions: Number(overviewRow[0]?.value ?? 0),
      activeUsers: Number(overviewRow[1]?.value ?? 0),
      screenPageViews: Number(overviewRow[2]?.value ?? 0),
      averageSessionDuration: Number(overviewRow[3]?.value ?? 0),
      engagementRate: Number(overviewRow[4]?.value ?? 0),
    };

    const topPages: Ga4TopPage[] =
      topPagesRes.rows?.map((r) => ({
        path: r.dimensionValues?.[0]?.value ?? "",
        title: r.dimensionValues?.[1]?.value ?? "",
        views: Number(r.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    const topEvents: Ga4EventRow[] =
      eventsRes.rows?.map((r) => ({
        eventName: r.dimensionValues?.[0]?.value ?? "",
        count: Number(r.metricValues?.[0]?.value ?? 0),
      })) ?? [];

    const eventLookup = new Map(topEvents.map((e) => [e.eventName, e.count]));

    return {
      status: "ok",
      report: {
        dateRange,
        overview,
        topPages,
        diagnosticStarts: eventLookup.get("diagnostic_started") ?? 0,
        diagnosticCompletions: eventLookup.get("diagnostic_completed") ?? 0,
        newsletterSignups: eventLookup.get("newsletter_signup") ?? 0,
        outboundClicks:
          (eventLookup.get("external_link_click") ?? 0) +
          (eventLookup.get("course_interest_click") ?? 0),
        topEvents,
      },
    };
  } catch (err) {
    return {
      status: "error",
      message: (err as Error).message,
      lookerStudioUrl,
    };
  }
}
