// Sentry client-side configuration — loaded by the browser bundle.
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance: sample 10% of transactions in production.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay: capture 0% of sessions by default, 100% on error.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production (or when DSN is explicitly set in dev).
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media for privacy.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
