"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { NotificationSettings } from "@/components/admin/NotificationSettings";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const siteUrl = "https://sowa.skillnetireland.ie";
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  function copySitemapUrl() {
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account and platform settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Name</label>
              <Input defaultValue={session?.user?.name ?? ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
              <Input defaultValue={session?.user?.email ?? ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Role</label>
              <div className="mt-1">
                <Badge variant="accent">{session?.user?.role ?? "—"}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                Change Password
              </label>
              <Input type="password" placeholder="New password" />
            </div>
            <div>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={saving}
              onClick={() => {
                setSaving(true);
                setTimeout(() => setSaving(false), 1000);
              }}
            >
              {saving ? "Saving..." : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          </div>
          <p className="mb-4 text-sm text-text-secondary">
            Choose which email notifications you receive for content workflow events.
          </p>
          <NotificationSettings />
        </div>

        {/* SEO Tools */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">SEO Tools</h2>
          </div>
          <p className="mb-4 text-sm text-text-secondary">
            Submit your sitemap to search engines to ensure all pages are indexed and discoverable.
          </p>

          {/* Sitemap URL */}
          <div className="mb-5 rounded-lg border border-gray-100 bg-surface p-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
              Sitemap URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-gray-100 px-3 py-2 text-sm text-text-primary">
                {sitemapUrl}
              </code>
              <Button variant="outline" size="sm" onClick={copySitemapUrl} className="shrink-0">
                {copiedSitemap ? (
                  <Check className="mr-1 h-4 w-4 text-secondary" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                {copiedSitemap ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Search console links */}
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-dark">
                  Google Search Console
                </p>
                <p className="text-xs text-text-secondary">Submit sitemap &amp; monitor indexing</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-text-muted group-hover:text-accent" />
            </a>

            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M4.5 3v18l5-2.5V5.5L4.5 3z" fill="#0C8484" />
                  <path d="M9.5 5.5v13l7 3.5V9L9.5 5.5z" fill="#10A5A5" />
                  <path d="M16.5 9v13l3-1.5V7.5L16.5 9z" fill="#0C8484" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-dark">
                  Bing Webmaster Tools
                </p>
                <p className="text-xs text-text-secondary">Submit sitemap to Bing &amp; Yahoo</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-text-muted group-hover:text-accent" />
            </a>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Copy the sitemap URL above, then paste it in each search console to request indexing of
            all platform pages.
          </p>
        </div>

        {/* Marketing Pixels */}
        <MarketingPixelsCard />

        {/* Platform */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Platform</h2>
          </div>
          <p className="text-sm text-text-secondary">
            Platform configuration options will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marketing Pixels card (inline — only used here)
// ---------------------------------------------------------------------------

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "";

const META_EVENTS = [
  { event: "PageView", trigger: "Every page load (automatic)" },
  { event: "Lead", trigger: "Diagnostic completion, outbound course clicks" },
  { event: "CompleteRegistration", trigger: "Course or event registration" },
  { event: "Subscribe", trigger: "Newsletter signup" },
];

const LINKEDIN_EVENTS = [
  { event: "Page view", trigger: "Every page load (automatic via Insight Tag)" },
];

function MarketingPixelsCard() {
  const [docsOpen, setDocsOpen] = useState(false);

  const metaConfigured = META_PIXEL_ID.length > 0;
  const linkedinConfigured = LINKEDIN_PARTNER_ID.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-surface-card p-6 lg:col-span-2">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-accent-dark" />
        <h2 className="text-lg font-semibold text-text-primary">Marketing Pixels</h2>
      </div>
      <p className="mb-4 text-sm text-text-secondary">
        Consent-gated tracking pixels for retargeting and conversion measurement. Pixels only load
        when users grant marketing consent via the cookie banner.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Meta Pixel */}
        <div className="rounded-lg border border-gray-100 bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            {metaConfigured ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <XCircle className="h-4 w-4 text-text-muted" />
            )}
            <span className="text-sm font-medium text-text-primary">Meta Pixel (Facebook)</span>
          </div>
          <p className="text-xs text-text-secondary">
            {metaConfigured
              ? `Configured — ID: ${META_PIXEL_ID}`
              : "Not configured. Set NEXT_PUBLIC_META_PIXEL_ID."}
          </p>
          {metaConfigured && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-text-secondary">Events tracked:</p>
              <ul className="space-y-0.5">
                {META_EVENTS.map((e) => (
                  <li key={e.event} className="text-xs text-text-muted">
                    <code className="rounded bg-white px-1 py-0.5 text-[11px]">{e.event}</code> —{" "}
                    {e.trigger}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* LinkedIn Insight Tag */}
        <div className="rounded-lg border border-gray-100 bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            {linkedinConfigured ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <XCircle className="h-4 w-4 text-text-muted" />
            )}
            <span className="text-sm font-medium text-text-primary">LinkedIn Insight Tag</span>
          </div>
          <p className="text-xs text-text-secondary">
            {linkedinConfigured
              ? `Configured — Partner ID: ${LINKEDIN_PARTNER_ID}`
              : "Not configured. Set NEXT_PUBLIC_LINKEDIN_PARTNER_ID."}
          </p>
          {linkedinConfigured && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-text-secondary">Events tracked:</p>
              <ul className="space-y-0.5">
                {LINKEDIN_EVENTS.map((e) => (
                  <li key={e.event} className="text-xs text-text-muted">
                    <code className="rounded bg-white px-1 py-0.5 text-[11px]">{e.event}</code> —{" "}
                    {e.trigger}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Expandable setup docs */}
      <button
        className="mt-4 flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
        onClick={() => setDocsOpen(!docsOpen)}
      >
        {docsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {docsOpen ? "Hide setup instructions" : "Show setup instructions"}
      </button>

      {docsOpen && (
        <div className="mt-3 space-y-4 rounded-lg border border-gray-100 bg-surface p-4 text-sm text-text-secondary">
          <div>
            <h3 className="mb-1 font-semibold text-text-primary">Meta Pixel Setup</h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Go to{" "}
                <a
                  href="https://business.facebook.com/events_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dark"
                >
                  Meta Events Manager
                </a>{" "}
                and create or find your Pixel.
              </li>
              <li>Copy the Pixel ID (numeric, e.g. 123456789012345).</li>
              <li>
                Set{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_META_PIXEL_ID
                </code>{" "}
                in Vercel Environment Variables (Production + Preview).
              </li>
              <li>Redeploy. The pixel loads automatically when users accept marketing cookies.</li>
              <li>Verify in Meta Events Manager &gt; Test Events using the browser extension.</li>
            </ol>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-text-primary">LinkedIn Insight Tag Setup</h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Go to{" "}
                <a
                  href="https://www.linkedin.com/campaignmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dark"
                >
                  LinkedIn Campaign Manager
                </a>{" "}
                &gt; Analyze &gt; Insight Tag.
              </li>
              <li>Copy the Partner ID (numeric).</li>
              <li>
                Set{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_LINKEDIN_PARTNER_ID
                </code>{" "}
                in Vercel Environment Variables.
              </li>
              <li>Redeploy. The tag loads when users accept marketing cookies.</li>
              <li>Verify in Campaign Manager &gt; Insight Tag &gt; Domains.</li>
            </ol>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-text-primary">How to verify pixel firing</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Open browser Dev Tools &gt; Network tab, filter by "fbevents" or "insight.min.js".
              </li>
              <li>Accept marketing cookies on the site, then reload.</li>
              <li>You should see the pixel script load and fire initial events.</li>
              <li>
                Install the{" "}
                <a
                  href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dark"
                >
                  Meta Pixel Helper
                </a>{" "}
                Chrome extension for real-time debugging.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
