/**
 * Report template definitions. Each template describes a pre-configured
 * analytics report: which data to fetch, how to label columns for export,
 * and metadata for the UI.
 */

export type ReportId = "overview" | "campaign" | "content" | "journey" | "registration";

export interface ReportTemplate {
  id: ReportId;
  label: string;
  description: string;
  csvColumns: { key: string; header: string }[];
}

export const REPORT_TEMPLATES: Record<ReportId, ReportTemplate> = {
  overview: {
    id: "overview",
    label: "Overview",
    description: "Sessions, page views, conversions, top content, and custom events.",
    csvColumns: [
      { key: "metric", header: "Metric" },
      { key: "value", header: "Value" },
    ],
  },
  campaign: {
    id: "campaign",
    label: "Campaign Performance",
    description: "Traffic sources and conversions broken down by UTM source, medium, and campaign.",
    csvColumns: [
      { key: "source", header: "Source" },
      { key: "medium", header: "Medium" },
      { key: "campaign", header: "Campaign" },
      { key: "sessions", header: "Sessions" },
      { key: "activeUsers", header: "Active Users" },
      { key: "conversions", header: "Conversions" },
      { key: "engagementRate", header: "Engagement Rate" },
    ],
  },
  content: {
    id: "content",
    label: "Content Performance",
    description: "Top pages with engagement metrics: views, users, duration, bounce rate.",
    csvColumns: [
      { key: "path", header: "Page Path" },
      { key: "title", header: "Title" },
      { key: "views", header: "Page Views" },
      { key: "activeUsers", header: "Active Users" },
      { key: "avgDuration", header: "Avg Duration (s)" },
      { key: "engagementRate", header: "Engagement Rate" },
      { key: "bounceRate", header: "Bounce Rate" },
    ],
  },
  journey: {
    id: "journey",
    label: "User Journey",
    description: "Landing pages and diagnostic funnel: starts vs. completions over time.",
    csvColumns: [
      { key: "landingPage", header: "Landing Page" },
      { key: "sessions", header: "Sessions" },
      { key: "activeUsers", header: "Active Users" },
      { key: "engagementRate", header: "Engagement Rate" },
    ],
  },
  registration: {
    id: "registration",
    label: "Registration Report",
    description:
      "Event and course registrations from the platform database: totals, status breakdown, conversion rate.",
    csvColumns: [
      { key: "title", header: "Event / Course Title" },
      { key: "type", header: "Type" },
      { key: "total", header: "Total Registrations" },
      { key: "confirmed", header: "Confirmed" },
      { key: "pending", header: "Pending" },
      { key: "cancelled", header: "Cancelled" },
    ],
  },
};

export const REPORT_IDS = Object.keys(REPORT_TEMPLATES) as ReportId[];

export const DATE_PRESETS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Custom range", value: "custom" },
] as const;
