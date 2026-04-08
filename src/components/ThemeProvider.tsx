import { getSiteSettings } from "@/lib/queries";
import { DEFAULT_SITE_SETTINGS } from "@/lib/theme-defaults";
import { getGoogleFontUrl, getFontStack } from "@/lib/fonts";

/**
 * Server component that injects CSS custom property overrides
 * and Google Font <link> tags based on SiteSettings.
 */
export async function ThemeProvider() {
  const settings = await getSiteSettings();

  // Build CSS overrides for any non-default color values
  const colorMap: Record<string, string> = {
    "--color-primary": settings.colorPrimary,
    "--color-primary-light": settings.colorPrimaryLight,
    "--color-primary-dark": settings.colorPrimaryDark,
    "--color-secondary": settings.colorSecondary,
    "--color-secondary-light": settings.colorSecondaryLight,
    "--color-secondary-dark": settings.colorSecondaryDark,
    "--color-accent": settings.colorAccent,
    "--color-accent-light": settings.colorAccentLight,
    "--color-accent-dark": settings.colorAccentDark,
  };

  const defaultColorMap: Record<string, string> = {
    "--color-primary": DEFAULT_SITE_SETTINGS.colorPrimary,
    "--color-primary-light": DEFAULT_SITE_SETTINGS.colorPrimaryLight,
    "--color-primary-dark": DEFAULT_SITE_SETTINGS.colorPrimaryDark,
    "--color-secondary": DEFAULT_SITE_SETTINGS.colorSecondary,
    "--color-secondary-light": DEFAULT_SITE_SETTINGS.colorSecondaryLight,
    "--color-secondary-dark": DEFAULT_SITE_SETTINGS.colorSecondaryDark,
    "--color-accent": DEFAULT_SITE_SETTINGS.colorAccent,
    "--color-accent-light": DEFAULT_SITE_SETTINGS.colorAccentLight,
    "--color-accent-dark": DEFAULT_SITE_SETTINGS.colorAccentDark,
  };

  const overrides: string[] = [];

  for (const [prop, value] of Object.entries(colorMap)) {
    if (value !== defaultColorMap[prop]) {
      overrides.push(`  ${prop}: ${value};`);
    }
  }

  // Font overrides
  if (settings.bodyFont) {
    overrides.push(`  --font-sans: ${getFontStack(settings.bodyFont)};`);
  }
  if (settings.headingFont) {
    overrides.push(`  --font-heading: ${getFontStack(settings.headingFont)};`);
  }

  const css = overrides.length > 0 ? `:root {\n${overrides.join("\n")}\n}` : "";

  // Collect Google Font URLs to load
  const fontUrls: string[] = [];
  if (settings.bodyFont) {
    const url = getGoogleFontUrl(settings.bodyFont);
    if (url) fontUrls.push(url);
  }
  if (settings.headingFont && settings.headingFont !== settings.bodyFont) {
    const url = getGoogleFontUrl(settings.headingFont);
    if (url) fontUrls.push(url);
  }

  return (
    <>
      {fontUrls.map((url) => (
        <link key={url} rel="stylesheet" href={url} />
      ))}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </>
  );
}
