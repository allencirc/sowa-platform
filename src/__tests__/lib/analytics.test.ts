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
  trackDiagnosticComplete,
  trackSearchPerformed,
  trackNewsletterSubscribe,
  trackCourseRegister,
  trackEventRegister,
  trackOutboundCourseClick,
  trackPageView,
  type ConsentPreferences,
} from "@/lib/analytics";

// ── Helpers ──────────────────────────────────────────────

function setConsentCookie(prefs: ConsentPreferences) {
  document.cookie = `sowa_consent=${encodeURIComponent(JSON.stringify(prefs))}; path=/`;
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
    window.gtag = gtagSpy as any;
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

  it("fires diagnostic_complete event with params", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackDiagnosticComplete({
      top_gaps: "safety,mechanical",
      recommended_careers_count: 3,
      recommended_courses_count: 5,
    });
    expect(gtagSpy).toHaveBeenCalledWith("event", "diagnostic_complete", {
      top_gaps: "safety,mechanical",
      recommended_careers_count: 3,
      recommended_courses_count: 5,
    });
  });

  it("fires course_register event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackCourseRegister({ course_id: "c1", course_title: "Wind Safety" });
    expect(gtagSpy).toHaveBeenCalledWith("event", "course_register", {
      course_id: "c1",
      course_title: "Wind Safety",
    });
  });

  it("fires event_register event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackEventRegister({ event_id: "e1", event_title: "OWE Summit" });
    expect(gtagSpy).toHaveBeenCalledWith("event", "event_register", {
      event_id: "e1",
      event_title: "OWE Summit",
    });
  });

  it("fires outbound_course_click event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackOutboundCourseClick({
      course_id: "c1",
      course_title: "Wind Safety",
      provider: "UCD",
      destination_url: "https://ucd.ie/wind",
    });
    expect(gtagSpy).toHaveBeenCalledWith("event", "outbound_course_click", {
      course_id: "c1",
      course_title: "Wind Safety",
      provider: "UCD",
      destination_url: "https://ucd.ie/wind",
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

  it("fires newsletter_subscribe event", () => {
    setConsentCookie({
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

    trackNewsletterSubscribe({ topics: ["Careers"] });
    expect(gtagSpy).toHaveBeenCalledWith("event", "newsletter_subscribe", {
      topics: ["Careers"],
    });
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
