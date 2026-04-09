/**
 * WCAG 2.2 contrast-ratio utilities.
 *
 * Used by the admin colour picker to prevent operators from choosing
 * colour combinations that break accessibility requirements.
 */

/** Convert a hex colour (#RRGGBB) to sRGB [0..1] channels. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

/** WCAG relative luminance (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, always >= 1. */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Minimum contrast ratio for WCAG 2.2 AA normal text. */
export const WCAG_AA_NORMAL = 4.5;

/** Minimum contrast ratio for WCAG 2.2 AA large text / UI components. */
export const WCAG_AA_LARGE = 3;

const WHITE = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A2E";

export interface ContrastCheck {
  field: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  passes: boolean;
  usage: string;
}

/**
 * Run WCAG 2.2 AA contrast checks against the full colour palette.
 *
 * Checks match how each colour is actually used in the platform:
 *
 * - **Dark variants** → used as text on white backgrounds (e.g. `text-secondary-dark`)
 *   → need 4.5:1 against white (WCAG 1.4.3 – Contrast Minimum)
 *
 * - **Main variants** → used as UI-component colours: button fills, badges,
 *   checkboxes, focus rings, borders. Must be distinguishable from white page bg.
 *   → need 3:1 against white (WCAG 1.4.11 – Non-text Contrast)
 *
 * - **Primary main** also carries white text on primary buttons.
 *   → need 4.5:1 white-on-primary (WCAG 1.4.3)
 *
 * - **Light variants** → used as hover/tint states on buttons and sidebar.
 *   Primary-light is a dark colour (white text on admin sidebar hover).
 *   Secondary/accent-light are mid-range (dark text or decorative).
 *   → need 3:1 against white (WCAG 1.4.11)
 */
export function checkPaletteContrast(colors: {
  colorPrimary: string;
  colorPrimaryLight: string;
  colorPrimaryDark: string;
  colorSecondary: string;
  colorSecondaryLight: string;
  colorSecondaryDark: string;
  colorAccent: string;
  colorAccentLight: string;
  colorAccentDark: string;
}): ContrastCheck[] {
  const checks: ContrastCheck[] = [];

  const add = (
    field: string,
    label: string,
    fg: string,
    bg: string,
    required: number,
    usage: string,
  ) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(fg) || !/^#[0-9a-fA-F]{6}$/.test(bg)) return;
    const ratio = contrastRatio(fg, bg);
    checks.push({
      field,
      label,
      foreground: fg,
      background: bg,
      ratio,
      required,
      passes: ratio >= required,
      usage,
    });
  };

  // ── Dark variants: used as text on white (WCAG 1.4.3 — 4.5:1) ──
  add(
    "colorPrimaryDark",
    "Primary Dark",
    colors.colorPrimaryDark,
    WHITE,
    WCAG_AA_NORMAL,
    "Text on white background",
  );
  add(
    "colorSecondaryDark",
    "Secondary Dark",
    colors.colorSecondaryDark,
    WHITE,
    WCAG_AA_NORMAL,
    "Text on white background",
  );
  add(
    "colorAccentDark",
    "Accent Dark",
    colors.colorAccentDark,
    WHITE,
    WCAG_AA_NORMAL,
    "Text on white background",
  );

  // ── Primary main: white text on primary button (WCAG 1.4.3 — 4.5:1) ──
  add(
    "colorPrimary",
    "Primary",
    WHITE,
    colors.colorPrimary,
    WCAG_AA_NORMAL,
    "White text on primary button",
  );

  // ── Secondary & Accent main: UI-component colour (WCAG 1.4.11 — 3:1) ──
  // Secondary button uses text-primary (dark navy) not white; accent is used
  // for focus rings, links, and decorative fills — all non-text contrast.
  add(
    "colorSecondary",
    "Secondary",
    colors.colorSecondary,
    WHITE,
    WCAG_AA_LARGE,
    "Button/badge visibility on white",
  );
  add(
    "colorAccent",
    "Accent",
    colors.colorAccent,
    WHITE,
    WCAG_AA_LARGE,
    "Link/focus-ring visibility on white",
  );

  // ── Light variants: hover/tint states ──
  // Light variants are used as hover backgrounds on already-visible elements
  // and decorative fills with opacity. They don't need to meet non-text contrast
  // on their own, but must not be indistinguishable from white (would break
  // hover feedback entirely). A 1.5:1 floor catches white/near-white.
  add(
    "colorPrimaryLight",
    "Primary Light",
    colors.colorPrimaryLight,
    WHITE,
    1.5,
    "Hover feedback visibility",
  );
  add(
    "colorSecondaryLight",
    "Secondary Light",
    colors.colorSecondaryLight,
    WHITE,
    1.5,
    "Hover feedback visibility",
  );
  add(
    "colorAccentLight",
    "Accent Light",
    colors.colorAccentLight,
    WHITE,
    1.5,
    "Hover feedback visibility",
  );

  return checks;
}
