import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// CSP is now set dynamically by src/middleware.ts with per-request nonces.
// Only non-CSP security headers remain here.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  turbopack: { root: "." },
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Media assets are now served from Vercel Blob CDN — no local /uploads headers needed.
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress noisy build logs from the Sentry webpack plugin.
  silent: true,

  // Upload source maps so Sentry can de-minify stack traces.
  // Requires SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT env vars.
  widenClientFileUpload: true,

  // Delete source maps after upload — keeps them off the client bundle.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
