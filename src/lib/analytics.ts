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
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-XXXXXXXXXX'

// ---------------------------------------------------------------------------
// Consent helpers (cookie-based, shared with CookieConsent component)
// ---------------------------------------------------------------------------

export type ConsentCategory = 'analytics' | 'marketing'

export interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  timestamp: string // ISO date
}

const CONSENT_COOKIE = 'sowa_consent'

/** Read the consent cookie (works server & client side). */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1]
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as ConsentPreferences
  } catch {
    return null
  }
}

/** Write the consent cookie (365-day expiry, SameSite=Lax, path=/). */
export function setConsentPreferences(prefs: ConsentPreferences): void {
  const value = encodeURIComponent(JSON.stringify(prefs))
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function hasAnalyticsConsent(): boolean {
  return getConsentPreferences()?.analytics === true
}

export function hasMarketingConsent(): boolean {
  return getConsentPreferences()?.marketing === true
}

// ---------------------------------------------------------------------------
// Script loader — inject gtag.js only after consent
// ---------------------------------------------------------------------------

let gtagLoaded = false

/** Dynamically injects the GA4 script + dataLayer. Idempotent. */
export function loadGtagScript(): void {
  if (typeof window === 'undefined') return
  if (gtagLoaded) return
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return // no real ID configured

  gtagLoaded = true

  // dataLayer + gtag function
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window.dataLayer as unknown[]).push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
  })

  // Inject the script tag
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)
}

/**
 * Call once on app mount (or when consent changes).
 * Loads GA4 only if analytics consent has been given.
 */
export function initAnalytics(): void {
  if (hasAnalyticsConsent()) {
    loadGtagScript()
  }
}

// ---------------------------------------------------------------------------
// Low-level gtag wrapper
// ---------------------------------------------------------------------------

function sendEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return
  if (!gtagLoaded) loadGtagScript()
  window.gtag?.('event', name, params)
}

// ---------------------------------------------------------------------------
// Typed custom events — one function per event for call-site safety
// ---------------------------------------------------------------------------

export function trackCareerView(params: {
  career_id: string
  career_title: string
  sector: string
}) {
  sendEvent('career_view', params)
}

export function trackCourseView(params: {
  course_id: string
  course_title: string
  provider: string
}) {
  sendEvent('course_view', params)
}

export function trackCourseInterestClick(params: {
  course_id: string
  destination: string
}) {
  sendEvent('course_interest_click', params)
}

export function trackEventView(params: {
  event_id: string
  event_title: string
  event_type: string
}) {
  sendEvent('event_view', params)
}

export function trackDiagnosticStarted() {
  sendEvent('diagnostic_started')
}

export function trackDiagnosticCompleted(params: {
  top_gaps?: string
  recommended_careers_count?: number
  recommended_courses_count?: number
}) {
  sendEvent('diagnostic_completed', params)
}

export function trackSearchPerformed(params: {
  query: string
  results_count: number
}) {
  sendEvent('search_performed', params)
}

export function trackResourceDownload(params: {
  resource_title: string
  resource_type: string
}) {
  sendEvent('resource_download', params)
}

export function trackExternalLinkClick(params: {
  destination_url: string
  context: string
}) {
  sendEvent('external_link_click', params)
}

export function trackNewsletterSignup() {
  sendEvent('newsletter_signup')
}

export function trackPathwayExplored(params: { pathway_id: string }) {
  sendEvent('pathway_explored', params)
}

// ---------------------------------------------------------------------------
// Page-view helper (App Router client navigation)
// ---------------------------------------------------------------------------

export function trackPageView(url: string) {
  sendEvent('page_view', {
    page_location: url,
    page_path: new URL(url, 'https://sowa.skillnetireland.ie').pathname,
  })
}

// ---------------------------------------------------------------------------
// Global type augmentation for window.gtag / window.dataLayer
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    dataLayer?: unknown[]
  }
}
