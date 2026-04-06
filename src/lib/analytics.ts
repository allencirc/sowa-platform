/**
 * GA4 Analytics — consent-aware, typed event tracking for SOWA platform.
 *
 * No tracking scripts are loaded until the user grants analytics consent.
 * All custom events use a typed helper so call-sites stay refactor-safe.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Replace with your real GA4 Measurement ID before going live. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-XXXXXXXXXX";

// ---------------------------------------------------------------------------
// Consent helpers (cookie-based, shared with CookieConsent component)
// ---------------------------------------------------------------------------

export type ConsentCategory = "analytics" | "marketing";

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO date
}

const CONSENT_COOKIE = "sowa_consent";

/** Read the consent cookie (works server & client side). */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as ConsentPreferences;
  } catch {
    return null;
  }
}

/** Write the consent cookie (365-day expiry, SameSite=Lax, path=/). */
export function setConsentPreferences(prefs: ConsentPreferences): void {
  const value = encodeURIComponent(JSON.stringify(prefs));
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentPreferences()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return getConsentPreferences()?.marketing === true;
}

// ---------------------------------------------------------------------------
// Script loader — inject gtag.js only after consent
// ---------------------------------------------------------------------------

let gtagLoaded = false;

/** Dynamically injects the GA4 script + dataLayer. Idempotent. */
export function loadGtagScript(): void {
  if (typeof window === "undefined") return;
  if (gtagLoaded) return;
  if (GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return; // no real ID configured

  gtagLoaded = true;

  // dataLayer + gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.dataLayer as unknown[]).push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: true,
  });

  // Inject the script tag
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Call once on app mount (or when consent changes).
 * Loads GA4 only if analytics consent has been given.
 */
export function initAnalytics(): void {
  if (hasAnalyticsConsent()) {
    loadGtagScript();
  }
}

// ---------------------------------------------------------------------------
// Low-level gtag wrapper
// ---------------------------------------------------------------------------

function sendEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  if (!gtagLoaded) loadGtagScript();
  window.gtag?.("event", name, params);
}

/**
 * Dispatch a Meta Pixel "Standard Event" (e.g. Lead, Subscribe,
 * CompleteRegistration) if the pixel is loaded. Safe no-op otherwise.
 * Gated by marketing consent via the pixel loader.
 */
function fireMetaStandardEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq = (window as any).fbq as undefined | ((...a: unknown[]) => void);
  fbq?.("track", eventName, params);
}

// ---------------------------------------------------------------------------
// Typed custom events — one function per event for call-site safety
// ---------------------------------------------------------------------------

export function trackCareerView(params: {
  career_id: string;
  career_title: string;
  sector: string;
}) {
  sendEvent("career_view", params);
}

export function trackCourseView(params: {
  course_id: string;
  course_title: string;
  provider: string;
}) {
  sendEvent("course_view", params);
}

export function trackEventView(params: {
  event_id: string;
  event_title: string;
  event_type: string;
}) {
  sendEvent("event_view", params);
}

export function trackDiagnosticStarted() {
  sendEvent("diagnostic_started");
}

/**
 * Conversion event — fired when a user reaches the diagnostic results screen.
 * GA4 event name: `diagnostic_complete`.
 */
export function trackDiagnosticComplete(params: {
  top_gaps?: string;
  recommended_careers_count?: number;
  recommended_courses_count?: number;
}) {
  sendEvent("diagnostic_complete", params);
  fireMetaStandardEvent("Lead", { content_name: "diagnostic" });
}

export function trackSearchPerformed(params: { query: string; results_count: number }) {
  sendEvent("search_performed", params);
}

export function trackResourceDownload(params: { resource_title: string; resource_type: string }) {
  sendEvent("resource_download", params);
}

export function trackExternalLinkClick(params: { destination_url: string; context: string }) {
  sendEvent("external_link_click", params);
}

/**
 * Conversion event — fired on successful in-site course interest submission.
 * GA4 event name: `course_register`.
 */
export function trackCourseRegister(params: { course_id: string; course_title: string }) {
  sendEvent("course_register", params);
  fireMetaStandardEvent("CompleteRegistration", {
    content_name: params.course_title,
    content_ids: [params.course_id],
    content_category: "course",
  });
}

/**
 * Conversion event — fired on successful in-site event registration.
 * GA4 event name: `event_register`.
 */
export function trackEventRegister(params: { event_id: string; event_title: string }) {
  sendEvent("event_register", params);
  fireMetaStandardEvent("CompleteRegistration", {
    content_name: params.event_title,
    content_ids: [params.event_id],
    content_category: "event",
  });
}

/**
 * Conversion event — fired on successful newsletter subscription.
 * GA4 event name: `newsletter_subscribe`.
 */
export function trackNewsletterSubscribe(params?: { topics?: string[] }) {
  sendEvent("newsletter_subscribe", params);
  fireMetaStandardEvent("Subscribe", {
    content_name: "newsletter",
  });
}

/**
 * Conversion event — fired when a user clicks through to an external course
 * provider from a SOWA course page. GA4 event name: `outbound_course_click`.
 */
export function trackOutboundCourseClick(params: {
  course_id: string;
  course_title: string;
  provider: string;
  destination_url: string;
}) {
  sendEvent("outbound_course_click", params);
  fireMetaStandardEvent("Lead", {
    content_name: params.course_title,
    content_ids: [params.course_id],
    content_category: "course_outbound",
  });
}

export function trackPathwayExplored(params: { pathway_id: string }) {
  sendEvent("pathway_explored", params);
}

// ---------------------------------------------------------------------------
// Page-view helper (App Router client navigation)
// ---------------------------------------------------------------------------

export function trackPageView(url: string) {
  sendEvent("page_view", {
    page_location: url,
    page_path: new URL(url, "https://sowa.skillnetireland.ie").pathname,
  });
}

// ---------------------------------------------------------------------------
// Global type augmentation for window.gtag / window.dataLayer
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}
