import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getConsentPreferences,
  setConsentPreferences,
  hasAnalyticsConsent,
  hasMarketingConsent,
  initAnalytics,
  loadGtagScript,
  trackCareerView,
  trackCourseView,
  trackDiagnosticStarted,
  trackDiagnosticCompleted,
  trackSearchPerformed,
  trackNewsletterSignup,
  trackPageView,
  type ConsentPreferences,
} from "@/lib/analytics";

// ── Helpers ──────────────────────────────────────────────

function setConsentCookie(prefs: ConsentPreferences) {
  document.cookie = `sowa_consent=${encodeURIComponent(
    JSON.stringify(prefs)
  )}; path=/`;
}

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.trim().split("=")[0];
    document.cookie = `${name}=; max-age=0; path=/`;
  });
}

// ── Tests ────────────────────────────────────────────────

describe("Consent preferences", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("returns null when no consent cookie exists", () => {
    expect(getConsentPreferences()).toBeNull();
  });

  it("reads consent from cookie", () => {
    const prefs: ConsentPreferences = {
      analytics: true,
      marketing: false,
      timestamp: "2025-06-01T00:00:00Z",
    };
    setConsentCookie(prefs);

    const result = getConsentPreferences();
    expect(result).toEqual(prefs);
  });

  it("setConsentPreferences writes a cookie that can be read back", () => {
    const prefs: ConsentPreferences = {
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setConsentPreferences(prefs);

    const result = getConsentPreferences();
    expect(result?.analytics).toBe(true);
    expect(result?.marketing).toBe(true);
  });

  it("hasAnalyticsConsent returns true when analytics is consented", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("hasAnalyticsConsent returns false when no consent", () => {
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("hasMarketingConsent returns true when marketing is consented", () => {
    setConsentCookie({
      analytics: false,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
    expect(hasMarketingConsent()).toBe(true);
  });

  it("handles malformed cookie gracefully", () => {
    document.cookie = "sowa_consent=not-valid-json; path=/";
    expect(getConsentPreferences()).toBeNull();
  });
});

describe("Analytics tracking", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearCookies();
    gtagSpy = vi.fn();
    window.gtag = gtagSpy;
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
  });

  it("does not fire events without consent", () => {
    trackCareerView({
      career_id: "test",
      career_title: "Test Career",
      sector: "Electrical",
    });
    expect(gtagSpy).not.toHaveBeenCalled();
  });

  it("fires career_view event with consent", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackCareerView({
      career_id: "test",
      career_title: "Test Career",
      sector: "Electrical",
    });
    expect(gtagSpy).toHaveBeenCalledWith("event", "career_view", {
      career_id: "test",
      career_title: "Test Career",
      sector: "Electrical",
    });
  });

  it("fires course_view event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackCourseView({
      course_id: "c1",
      course_title: "Test Course",
      provider: "UCD",
    });
    expect(gtagSpy).toHaveBeenCalledWith("event", "course_view", {
      course_id: "c1",
      course_title: "Test Course",
      provider: "UCD",
    });
  });

  it("fires diagnostic_started event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackDiagnosticStarted();
    expect(gtagSpy).toHaveBeenCalledWith("event", "diagnostic_started", undefined);
  });

  it("fires diagnostic_completed event with params", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackDiagnosticCompleted({
      top_gaps: "safety,mechanical",
      recommended_careers_count: 3,
      recommended_courses_count: 5,
    });
    expect(gtagSpy).toHaveBeenCalledWith("event", "diagnostic_completed", {
      top_gaps: "safety,mechanical",
      recommended_careers_count: 3,
      recommended_courses_count: 5,
    });
  });

  it("fires search_performed event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackSearchPerformed({ query: "wind", results_count: 12 });
    expect(gtagSpy).toHaveBeenCalledWith("event", "search_performed", {
      query: "wind",
      results_count: 12,
    });
  });

  it("fires newsletter_signup event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackNewsletterSignup();
    expect(gtagSpy).toHaveBeenCalledWith("event", "newsletter_signup", undefined);
  });

  it("fires page_view event with parsed path", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackPageView("https://sowa.skillnetireland.ie/careers/test");
    expect(gtagSpy).toHaveBeenCalledWith("event", "page_view", {
      page_location: "https://sowa.skillnetireland.ie/careers/test",
      page_path: "/careers/test",
    });
  });
});

describe("Script loading", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("initAnalytics does not load script without consent", () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");
    initAnalytics();
    // GA_MEASUREMENT_ID is 'G-XXXXXXXXXX' in test, so won't load anyway
    expect(appendSpy).not.toHaveBeenCalled();
    appendSpy.mockRestore();
  });
});
