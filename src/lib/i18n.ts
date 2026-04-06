import "server-only";

/**
 * SOWA internationalisation — see docs/adr/0001-i18n.md
 *
 * We use Next.js built-in i18n (no runtime library). Dictionaries live in
 * `messages/{locale}.json` at the repo root and are imported lazily so each
 * page only loads the language it actually renders.
 *
 * English (`en`) is the source of truth — every key in `en.json` must exist
 * in every other locale. Untranslated strings are marked with a `[TODO]`
 * prefix so we can grep for them: `grep -r "\[TODO\]" messages/`.
 */

export const locales = ["en", "ga", "pl", "uk", "pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * Human-readable native-script labels for the language switcher.
 * Keep in sync with `messages/{locale}.json → locale.nativeName`.
 */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  ga: "Gaeilge",
  pl: "Polski",
  uk: "Українська",
  pt: "Português",
};

/** BCP-47 tag for `<html lang>` and `Intl.*` formatters. */
export const localeBcp47: Record<Locale, string> = {
  en: "en-IE",
  ga: "ga-IE",
  pl: "pl-PL",
  uk: "uk-UA",
  pt: "pt-PT",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Pick the best supported locale for a given `Accept-Language` header.
 * Falls back to `defaultLocale` if nothing matches.
 *
 * Lightweight on purpose — parses `q=` weights and strips region tags
 * (`en-US` → `en`, `pt-BR` → `pt`). For anything more advanced we'd pull
 * in `@formatjs/intl-localematcher`, but that adds a dependency we don't
 * need for five locales.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const parsed = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((p) => p.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of parsed) {
    // Exact match (e.g. "pl") or primary-subtag match (e.g. "pt-br" → "pt").
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return defaultLocale;
}

/**
 * Prefix a path with the current locale. `/` becomes `/en`, `/careers`
 * becomes `/en/careers`. Idempotent — if the path already starts with a
 * supported locale it is returned unchanged.
 */
export function localeHref(locale: Locale, path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

/**
 * Deep-readonly string tree. We type the dictionary against the English
 * file so consumers get autocomplete on every key.
 */
type Dict = typeof import("../../messages/en.json");

const dictionaries: Record<Locale, () => Promise<Dict>> = {
  en: () => import("../../messages/en.json").then((m) => m.default as Dict),
  ga: () => import("../../messages/ga.json").then((m) => m.default as Dict),
  pl: () => import("../../messages/pl.json").then((m) => m.default as Dict),
  uk: () => import("../../messages/uk.json").then((m) => m.default as Dict),
  pt: () => import("../../messages/pt.json").then((m) => m.default as Dict),
};

export async function getDictionary(locale: Locale): Promise<Dict> {
  return dictionaries[locale]();
}

export type Dictionary = Dict;

/**
 * Tiny ICU-lite interpolator: replaces `{name}` placeholders with values
 * from the supplied params object. Not a full ICU implementation — if we
 * need plurals/selectors we'll adopt `@formatjs/intl-messageformat` then.
 */
export function format(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}
