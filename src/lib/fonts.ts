import { WEB_SAFE_FONTS } from "./theme-defaults";

const GOOGLE_FONT_WEIGHTS = "400;500;600;700";

/**
 * Returns the Google Fonts CSS2 URL for a given font name,
 * or null if the font is web-safe and doesn't need loading.
 */
export function getGoogleFontUrl(fontName: string): string | null {
  if ((WEB_SAFE_FONTS as readonly string[]).includes(fontName)) {
    return null;
  }
  const family = fontName.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${GOOGLE_FONT_WEIGHTS}&display=swap`;
}

/**
 * Returns a CSS font-family value with appropriate fallbacks.
 */
export function getFontStack(fontName: string): string {
  return `"${fontName}", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`;
}
