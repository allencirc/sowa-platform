/**
 * Email dispatch abstraction.
 * Uses SMTP (nodemailer) when EMAIL_ENABLED=true; logs otherwise.
 * All errors are caught internally — sendEmail never throws.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (process.env.EMAIL_ENABLED !== "true") {
    console.log(`[Email] (disabled) Would send to ${to}: ${subject}`);
    return;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? "SOWA Platform <noreply@sowa.skillnetireland.ie>",
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
  }
}

// ─── Email Templates ──────────────────────────────────────

const BRAND_HEADER = `
  <div style="background-color:#0C2340;padding:24px 32px;text-align:center;">
    <h1 style="color:#FFFFFF;font-family:Inter,system-ui,sans-serif;font-size:20px;margin:0;">
      SOWA Platform
    </h1>
  </div>`;

const BRAND_FOOTER = `
  <div style="padding:16px 32px;text-align:center;font-size:12px;color:#6B7280;font-family:Inter,system-ui,sans-serif;">
    <p style="margin:0;">Skillnet Offshore Wind Academy</p>
    <p style="margin:4px 0 0;">
      <a href="${process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie"}/admin" style="color:#4A90D9;text-decoration:none;">
        Go to Admin Dashboard
      </a>
    </p>
  </div>`;

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;">
    ${BRAND_HEADER}
    <div style="padding:24px 32px;">
      ${body}
    </div>
    ${BRAND_FOOTER}
  </div>
</body>
</html>`;
}

function formatContentType(ct: string): string {
  return ct.charAt(0) + ct.slice(1).toLowerCase();
}

export function contentSubmittedForReview(
  contentTitle: string,
  contentType: string,
  authorName: string,
): { subject: string; html: string } {
  return {
    subject: `[Review Required] ${contentTitle}`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">New Content Awaiting Review</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        <strong>${authorName}</strong> has submitted a ${formatContentType(contentType)} for review:
      </p>
      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0;font-weight:600;color:#1A1A2E;">${contentTitle}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${formatContentType(contentType)}</p>
      </div>
      <p style="color:#6B7280;margin:0;line-height:1.5;">
        Please review this content in the admin dashboard.
      </p>
    `),
  };
}

export function contentApproved(
  contentTitle: string,
  contentType: string,
): { subject: string; html: string } {
  return {
    subject: `Your ${formatContentType(contentType)} has been approved`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">Content Approved</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        Your ${formatContentType(contentType)} has been approved and is now published:
      </p>
      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0;font-weight:600;color:#1A1A2E;">${contentTitle}</p>
      </div>
    `),
  };
}

export function contentRejected(
  contentTitle: string,
  contentType: string,
  rejectionNote: string,
): { subject: string; html: string } {
  return {
    subject: `Changes requested: ${contentTitle}`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">Changes Requested</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        Your ${formatContentType(contentType)} has been returned for revisions:
      </p>
      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:12px 16px;border-radius:4px;margin:0 0 8px;">
        <p style="margin:0;font-weight:600;color:#1A1A2E;">${contentTitle}</p>
      </div>
      <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#DC2626;">Reviewer Notes</p>
        <p style="margin:4px 0 0;color:#1A1A2E;line-height:1.5;">${rejectionNote}</p>
      </div>
      <p style="color:#6B7280;margin:0;line-height:1.5;">
        Please address the feedback and resubmit for review.
      </p>
    `),
  };
}

export function contentPublished(
  contentTitle: string,
  contentType: string,
): { subject: string; html: string } {
  return {
    subject: `Published: ${contentTitle}`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">Content Published</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        Your ${formatContentType(contentType)} is now live on the platform:
      </p>
      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:12px 16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0;font-weight:600;color:#1A1A2E;">${contentTitle}</p>
      </div>
    `),
  };
}

// ─── Team Assessment Email Templates ─────────────────────

export function teamCreated(
  teamName: string,
  teamLink: string,
  reportLink: string,
): { subject: string; html: string } {
  return {
    subject: `Your SOWA Team Assessment is ready: ${teamName}`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">Team Assessment Created</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        Your team assessment <strong>"${teamName}"</strong> has been set up. Share the link below with your team members to get started.
      </p>

      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;">Team Assessment Link</p>
        <p style="margin:0;word-break:break-all;">
          <a href="${teamLink}" style="color:#4A90D9;text-decoration:none;font-weight:600;">${teamLink}</a>
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#9CA3AF;">Share this link with your team members. Each person completes the assessment individually.</p>
      </div>

      <div style="background:#F7F9FC;border-left:4px solid #4A90D9;padding:16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;">Your Private Report Link</p>
        <p style="margin:0;word-break:break-all;">
          <a href="${reportLink}" style="color:#4A90D9;text-decoration:none;font-weight:600;">${reportLink}</a>
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#9CA3AF;">Bookmark this link — it's your private view of the aggregated team results. Do not share it with team members if you want results to remain anonymised.</p>
      </div>

      <p style="color:#6B7280;margin:0;line-height:1.5;">
        We'll email you again when enough responses have been received to generate your team training report.
      </p>
    `),
  };
}

export function teamThresholdReached(
  teamName: string,
  responseCount: number,
  reportLink: string,
  aiSummaryPreview: string,
): { subject: string; html: string } {
  return {
    subject: `Team Assessment Ready: ${teamName} (${responseCount} responses)`,
    html: wrap(`
      <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 12px;">Your Team Report is Ready</h2>
      <p style="color:#6B7280;margin:0 0 16px;line-height:1.5;">
        <strong>${responseCount}</strong> team members have completed the assessment for <strong>"${teamName}"</strong>. Your AI-generated training needs analysis is ready to review.
      </p>

      <div style="background:#F7F9FC;border-left:4px solid #00A878;padding:16px;border-radius:4px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;">Report Preview</p>
        <p style="margin:0;color:#1A1A2E;line-height:1.5;font-size:14px;">${aiSummaryPreview}</p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${reportLink}" style="display:inline-block;background-color:#00A878;color:#FFFFFF;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
          View Full Team Report
        </a>
      </div>

      <p style="color:#6B7280;margin:0;line-height:1.5;font-size:13px;">
        Team members can continue completing the assessment — your report will update with new responses.
      </p>
    `),
  };
}
