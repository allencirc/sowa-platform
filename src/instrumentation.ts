// Next.js instrumentation hook — initialises Sentry on server/edge startup.
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Sentry v10+ captures server-component and route-handler errors
// automatically via the withSentryConfig wrapper — no explicit
// onRequestError re-export needed.
