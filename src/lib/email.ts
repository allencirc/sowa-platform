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
