"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Shield, Bell, Globe, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

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
          <p className="text-sm text-text-secondary">
            Notification preferences will be available in a future update.
          </p>
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
