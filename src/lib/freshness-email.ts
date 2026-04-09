/**
 * Email digest template for content freshness alerts.
 */

import { wrap } from "@/lib/email";
import type { FreshnessAlertItem } from "@/lib/freshness-check";

const ALERT_TYPE_LABELS: Record<string, string> = {
  EXPIRED_DATE: "Expired Date",
  STALE: "Stale Content",
  OUTDATED: "Outdated",
};

const ALERT_TYPE_COLORS: Record<string, string> = {
  EXPIRED_DATE: "#DC2626",
  STALE: "#F59E0B",
  OUTDATED: "#EA580C",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  CAREER: "Careers",
  COURSE: "Courses",
  EVENT: "Events",
  RESEARCH: "Research",
  NEWS: "News",
};

const EDIT_PATH_MAP: Record<string, (slug: string) => string> = {
  CAREER: (slug) => `/admin/careers/${slug}/edit`,
  COURSE: (slug) => `/admin/courses/${slug}/edit`,
  EVENT: (slug) => `/admin/events/${slug}/edit`,
  RESEARCH: (slug) => `/admin/research/${slug}/edit`,
  NEWS: (slug) => `/admin/news/${slug}/edit`,
};

/**
 * Generate the HTML email digest for freshness alerts.
 */
export function generateFreshnessDigestHtml(alerts: FreshnessAlertItem[]): {
  subject: string;
  html: string;
} {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
  const count = alerts.length;

  // Group alerts by contentType
  const grouped = new Map<string, FreshnessAlertItem[]>();
  for (const alert of alerts) {
    const key = alert.contentType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(alert);
  }

  let tablesHtml = "";
  for (const [type, items] of grouped) {
    const rows = items
      .map((item) => {
        const editUrl = `${baseUrl}${EDIT_PATH_MAP[type](item.slug)}`;
        const color = ALERT_TYPE_COLORS[item.alertType] ?? "#6B7280";
        const label = ALERT_TYPE_LABELS[item.alertType] ?? item.alertType;
        const date = item.detectedAt.toLocaleDateString("en-IE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;">
            <a href="${editUrl}" style="color:#4A90D9;text-decoration:none;font-weight:500;">${item.title}</a>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;">
            <span style="background:${color}20;color:${color};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">${label}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#6B7280;font-size:13px;">${date}</td>
        </tr>`;
      })
      .join("");

    tablesHtml += `
      <h3 style="color:#1A1A2E;font-size:16px;margin:24px 0 8px;">${CONTENT_TYPE_LABELS[type] ?? type} (${items.length})</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#F7F9FC;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6B7280;font-size:12px;">Title</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6B7280;font-size:12px;">Alert</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6B7280;font-size:12px;">Detected</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  const body = `
    <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 8px;">Content Freshness Alert</h2>
    <p style="color:#6B7280;font-size:14px;margin:0 0 16px;">
      ${count} item${count !== 1 ? "s" : ""} need${count === 1 ? "s" : ""} attention across the platform.
    </p>
    ${tablesHtml}
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${baseUrl}/admin/freshness-alerts"
         style="display:inline-block;padding:12px 24px;background:#0C2340;color:#FFFFFF;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
        Review in Dashboard
      </a>
    </div>`;

  return {
    subject: `[SOWA] Content Freshness Alert — ${count} item${count !== 1 ? "s" : ""} need attention`,
    html: wrap(body),
  };
}
