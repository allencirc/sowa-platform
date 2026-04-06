/**
 * Marketing pixel placeholder slots.
 *
 * Each pixel only loads when:
 *   1. The user has granted "marketing" consent via the cookie banner.
 *   2. The corresponding environment variable is set (non-empty).
 *
 * To activate a pixel, add the env var to .env.local:
 *   NEXT_PUBLIC_META_PIXEL_ID=123456789
 *   NEXT_PUBLIC_LINKEDIN_PARTNER_ID=987654
 */

import { hasMarketingConsent } from "./analytics";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "";

// ---------------------------------------------------------------------------
// Meta Pixel (Facebook)
// ---------------------------------------------------------------------------

let metaLoaded = false;

function loadMetaPixel(): void {
  if (metaLoaded || !META_PIXEL_ID) return;
  metaLoaded = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any;
  if (w.fbq) return;

  const n: any = (w.fbq = function (...args: any[]) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  });
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  w.fbq("init", META_PIXEL_ID);
  w.fbq("track", "PageView");
}

// ---------------------------------------------------------------------------
// LinkedIn Insight Tag
// ---------------------------------------------------------------------------

let linkedInLoaded = false;

function loadLinkedInInsightTag(): void {
  if (linkedInLoaded || !LINKEDIN_PARTNER_ID) return;
  linkedInLoaded = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any;
  w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || [];
  w._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  document.head.appendChild(script);
}

// ---------------------------------------------------------------------------
// Public loader — called by CookieConsent when marketing consent is given
// ---------------------------------------------------------------------------

export function loadMarketingPixels(): void {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;

  loadMetaPixel();
  loadLinkedInInsightTag();
}
