/**
 * Canonical public URL of this deployment.
 *
 * Used for metadata, JSON-LD, robots.txt and sitemap.xml. Set
 * `NEXT_PUBLIC_SITE_URL` per deployment; the fallback keeps the original
 * SOWA production URL so existing deployments are unaffected.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://sowa.skillnetireland.ie";
}
