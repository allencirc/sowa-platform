"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Shield,
  Bell,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Palette,
  Type,
  Image as ImageIcon,
  Share2,
  RotateCcw,
  Save,
  Loader2,
  Trash2,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/admin/Textarea";
import { CURATED_FONTS, DEFAULT_SITE_SETTINGS } from "@/lib/theme-defaults";
import { getGoogleFontUrl } from "@/lib/fonts";
import { adminPatch } from "@/hooks/useAdminFetch";

interface SiteSettingsForm {
  colorPrimary: string;
  colorPrimaryLight: string;
  colorPrimaryDark: string;
  colorSecondary: string;
  colorSecondaryLight: string;
  colorSecondaryDark: string;
  colorAccent: string;
  colorAccentLight: string;
  colorAccentDark: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    facebook: string;
    youtube: string;
    instagram: string;
  };
}

const defaultForm: SiteSettingsForm = {
  colorPrimary: DEFAULT_SITE_SETTINGS.colorPrimary,
  colorPrimaryLight: DEFAULT_SITE_SETTINGS.colorPrimaryLight,
  colorPrimaryDark: DEFAULT_SITE_SETTINGS.colorPrimaryDark,
  colorSecondary: DEFAULT_SITE_SETTINGS.colorSecondary,
  colorSecondaryLight: DEFAULT_SITE_SETTINGS.colorSecondaryLight,
  colorSecondaryDark: DEFAULT_SITE_SETTINGS.colorSecondaryDark,
  colorAccent: DEFAULT_SITE_SETTINGS.colorAccent,
  colorAccentLight: DEFAULT_SITE_SETTINGS.colorAccentLight,
  colorAccentDark: DEFAULT_SITE_SETTINGS.colorAccentDark,
  headingFont: "",
  bodyFont: "",
  logoUrl: "",
  faviconUrl: "",
  footerText: "",
  socialLinks: { twitter: "", linkedin: "", facebook: "", youtube: "", instagram: "" },
};

const fontOptions = [
  { label: "Default (Inter)", value: "" },
  ...CURATED_FONTS.map((f) => ({ label: f, value: f })),
];

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 p-0.5"
      />
      <div className="flex-1">
        <label className="mb-0.5 block text-xs font-medium text-text-secondary">{label}</label>
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [form, setForm] = useState<SiteSettingsForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  const siteUrl = "https://sowa.skillnetireland.ie";
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  // Load current settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          colorPrimary: data.colorPrimary ?? defaultForm.colorPrimary,
          colorPrimaryLight: data.colorPrimaryLight ?? defaultForm.colorPrimaryLight,
          colorPrimaryDark: data.colorPrimaryDark ?? defaultForm.colorPrimaryDark,
          colorSecondary: data.colorSecondary ?? defaultForm.colorSecondary,
          colorSecondaryLight: data.colorSecondaryLight ?? defaultForm.colorSecondaryLight,
          colorSecondaryDark: data.colorSecondaryDark ?? defaultForm.colorSecondaryDark,
          colorAccent: data.colorAccent ?? defaultForm.colorAccent,
          colorAccentLight: data.colorAccentLight ?? defaultForm.colorAccentLight,
          colorAccentDark: data.colorAccentDark ?? defaultForm.colorAccentDark,
          headingFont: data.headingFont ?? "",
          bodyFont: data.bodyFont ?? "",
          logoUrl: data.logoUrl ?? "",
          faviconUrl: data.faviconUrl ?? "",
          footerText: data.footerText ?? "",
          socialLinks: {
            twitter: data.socialLinks?.twitter ?? "",
            linkedin: data.socialLinks?.linkedin ?? "",
            facebook: data.socialLinks?.facebook ?? "",
            youtube: data.socialLinks?.youtube ?? "",
            instagram: data.socialLinks?.instagram ?? "",
          },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load Google Fonts for preview
  useEffect(() => {
    const fonts = [form.headingFont, form.bodyFont].filter(Boolean);
    for (const font of fonts) {
      const url = getGoogleFontUrl(font);
      if (url && !document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
      }
    }
  }, [form.headingFont, form.bodyFont]);

  const updateForm = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  }, []);

  const updateSocialLink = useCallback((field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
    setSuccess(null);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        colorPrimary: form.colorPrimary || null,
        colorPrimaryLight: form.colorPrimaryLight || null,
        colorPrimaryDark: form.colorPrimaryDark || null,
        colorSecondary: form.colorSecondary || null,
        colorSecondaryLight: form.colorSecondaryLight || null,
        colorSecondaryDark: form.colorSecondaryDark || null,
        colorAccent: form.colorAccent || null,
        colorAccentLight: form.colorAccentLight || null,
        colorAccentDark: form.colorAccentDark || null,
        headingFont: form.headingFont || null,
        bodyFont: form.bodyFont || null,
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        footerText: form.footerText || null,
        socialLinks: Object.values(form.socialLinks).some(Boolean) ? form.socialLinks : null,
      };
      await adminPatch("/api/settings", payload);
      setSuccess("Theme settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setForm(defaultForm);
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminPatch("/api/settings", {
        colorPrimary: null,
        colorPrimaryLight: null,
        colorPrimaryDark: null,
        colorSecondary: null,
        colorSecondaryLight: null,
        colorSecondaryDark: null,
        colorAccent: null,
        colorAccentLight: null,
        colorAccentDark: null,
        headingFont: null,
        bodyFont: null,
        logoUrl: null,
        faviconUrl: null,
        footerText: null,
        socialLinks: null,
      });
      setSuccess("Theme reset to defaults.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(type: "logo" | "favicon") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(type);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/media", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        updateForm(type === "logo" ? "logoUrl" : "faviconUrl", data.url);
      } catch {
        setError(`Failed to upload ${type}`);
      } finally {
        setUploading(null);
      }
    };
    input.click();
  }

  function copySitemapUrl() {
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your account and platform settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {success && (
        <div className="mb-4 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm text-secondary-dark">
          <Check className="mr-1 inline h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-status-error/30 bg-status-error/5 px-4 py-3 text-sm text-status-error">
          {error}
        </div>
      )}

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
            <Button variant="primary" size="sm" disabled={saving}>
              Update Password
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
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">SEO Tools</h2>
          </div>
          <p className="mb-4 text-sm text-text-secondary">
            Submit your sitemap to search engines to ensure all pages are indexed.
          </p>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-accent hover:bg-accent/5"
            >
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
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-dark">
                  Bing Webmaster Tools
                </p>
                <p className="text-xs text-text-secondary">Submit sitemap to Bing &amp; Yahoo</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-text-muted group-hover:text-accent" />
            </a>
          </div>
        </div>

        {/* ─── Theme Customisation ─────────────────────────── */}

        {/* Color Settings */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Brand Colors</h2>
          </div>
          <p className="mb-5 text-sm text-text-secondary">
            Customise the platform color palette. Changes apply across the entire public site.
          </p>

          {/* Color swatch preview */}
          <div className="mb-6 flex gap-1 overflow-hidden rounded-lg">
            {[
              form.colorPrimaryDark,
              form.colorPrimary,
              form.colorPrimaryLight,
              form.colorSecondaryDark,
              form.colorSecondary,
              form.colorSecondaryLight,
              form.colorAccentDark,
              form.colorAccent,
              form.colorAccentLight,
            ].map((color, i) => (
              <div key={i} className="h-8 flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Primary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Primary</h3>
              <ColorPicker
                label="Main"
                value={form.colorPrimary}
                onChange={(v) => updateForm("colorPrimary", v)}
              />
              <ColorPicker
                label="Light"
                value={form.colorPrimaryLight}
                onChange={(v) => updateForm("colorPrimaryLight", v)}
              />
              <ColorPicker
                label="Dark"
                value={form.colorPrimaryDark}
                onChange={(v) => updateForm("colorPrimaryDark", v)}
              />
            </div>
            {/* Secondary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Secondary</h3>
              <ColorPicker
                label="Main"
                value={form.colorSecondary}
                onChange={(v) => updateForm("colorSecondary", v)}
              />
              <ColorPicker
                label="Light"
                value={form.colorSecondaryLight}
                onChange={(v) => updateForm("colorSecondaryLight", v)}
              />
              <ColorPicker
                label="Dark"
                value={form.colorSecondaryDark}
                onChange={(v) => updateForm("colorSecondaryDark", v)}
              />
            </div>
            {/* Accent */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">Accent</h3>
              <ColorPicker
                label="Main"
                value={form.colorAccent}
                onChange={(v) => updateForm("colorAccent", v)}
              />
              <ColorPicker
                label="Light"
                value={form.colorAccentLight}
                onChange={(v) => updateForm("colorAccentLight", v)}
              />
              <ColorPicker
                label="Dark"
                value={form.colorAccentDark}
                onChange={(v) => updateForm("colorAccentDark", v)}
              />
            </div>
          </div>
        </div>

        {/* Font Settings */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Type className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Typography</h2>
          </div>
          <div className="space-y-4">
            <Select
              label="Heading Font"
              options={fontOptions}
              value={form.headingFont}
              onChange={(e) => updateForm("headingFont", e.target.value)}
            />
            <Select
              label="Body Font"
              options={fontOptions}
              value={form.bodyFont}
              onChange={(e) => updateForm("bodyFont", e.target.value)}
            />
          </div>

          {/* Live preview */}
          <div className="mt-5 rounded-lg border border-gray-100 bg-surface p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
              Preview
            </p>
            <h3
              className="mb-2 text-xl font-bold text-text-primary"
              style={{
                fontFamily: form.headingFont ? `"${form.headingFont}", sans-serif` : undefined,
              }}
            >
              Heading Preview
            </h3>
            <p
              className="text-sm leading-relaxed text-text-secondary"
              style={{
                fontFamily: form.bodyFont ? `"${form.bodyFont}", sans-serif` : undefined,
              }}
            >
              The quick brown fox jumps over the lazy dog. This sample text demonstrates how your
              chosen body font will appear across the platform.
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Branding</h2>
          </div>
          <div className="space-y-5">
            {/* Logo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">Logo</label>
              {form.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={form.logoUrl}
                    alt="Site logo"
                    className="h-12 max-w-[200px] rounded border border-gray-200 object-contain p-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => updateForm("logoUrl", "")}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpload("logo")}
                  disabled={uploading === "logo"}
                >
                  {uploading === "logo" ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-1 h-4 w-4" />
                  )}
                  Upload Logo
                </Button>
              )}
            </div>
            {/* Favicon */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">Favicon</label>
              {form.faviconUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={form.faviconUrl}
                    alt="Favicon"
                    className="h-8 w-8 rounded border border-gray-200 object-contain p-0.5"
                  />
                  <Button variant="outline" size="sm" onClick={() => updateForm("faviconUrl", "")}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpload("favicon")}
                  disabled={uploading === "favicon"}
                >
                  {uploading === "favicon" ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-1 h-4 w-4" />
                  )}
                  Upload Favicon
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer & Social Links */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent-dark" />
            <h2 className="text-lg font-semibold text-text-primary">Footer &amp; Social Links</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Footer text */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                Footer Text
              </label>
              <Textarea
                value={form.footerText}
                onChange={(e) => updateForm("footerText", e.target.value)}
                placeholder="Custom footer text displayed below the site navigation..."
                rows={4}
              />
              <p className="mt-1 text-xs text-text-muted">{form.footerText.length}/1000</p>
            </div>
            {/* Social links */}
            <div className="space-y-3">
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                Social Media Links
              </label>
              {[
                { key: "twitter", label: "Twitter / X" },
                { key: "linkedin", label: "LinkedIn" },
                { key: "facebook", label: "Facebook" },
                { key: "youtube", label: "YouTube" },
                { key: "instagram", label: "Instagram" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-text-muted" />
                  <Input
                    value={form.socialLinks[key as keyof typeof form.socialLinks]}
                    onChange={(e) => updateSocialLink(key, e.target.value)}
                    placeholder={`${label} URL`}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
