// Default theme values matching the @theme inline block in globals.css.
// Used as fallbacks when SiteSettings fields are null.

export const DEFAULT_SITE_SETTINGS = {
  colorPrimary: "#0c2340",
  colorPrimaryLight: "#1a3a5c",
  colorPrimaryDark: "#081828",
  colorSecondary: "#00a878",
  colorSecondaryLight: "#00c98e",
  colorSecondaryDark: "#006b4a",
  colorAccent: "#4a90d9",
  colorAccentLight: "#6ba8e8",
  colorAccentDark: "#2564a8",
  headingFont: null as string | null,
  bodyFont: null as string | null,
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
  footerText: null as string | null,
  socialLinks: null as Record<string, string> | null,
};

export type SiteSettings = typeof DEFAULT_SITE_SETTINGS;

export const WEB_SAFE_FONTS = [
  "Arial",
  "Georgia",
  "Verdana",
  "Times New Roman",
  "Trebuchet MS",
] as const;

export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Source Sans 3",
  "Poppins",
  "Raleway",
  "Nunito",
  "Work Sans",
  "DM Sans",
  "Outfit",
] as const;

export const CURATED_FONTS = [...WEB_SAFE_FONTS, ...GOOGLE_FONTS] as const;
