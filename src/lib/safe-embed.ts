/**
 * SafeEmbed — URL parsing and allowlist enforcement for embeddable media.
 *
 * Only providers in ALLOWED_PROVIDERS can be embedded. URLs are normalised
 * into provider-specific iframe `src` URLs. Raw HTML is never trusted —
 * callers store the structured output (provider + id + url) as a node.
 */

export type EmbedProvider = "youtube" | "vimeo" | "twitter" | "linkedin";

export interface ParsedEmbed {
  provider: EmbedProvider;
  /** Canonical original URL (https). */
  url: string;
  /** Provider-specific opaque id (video id, tweet id, update urn, etc.). */
  id: string;
  /** iframe src to render. Always https, always a provider embed endpoint. */
  embedUrl: string;
}

/**
 * Host allowlist. Exact match or `*.<host>` subdomain match.
 * Kept narrow — REQ-F-48 specifies these four providers only.
 */
export const ALLOWED_EMBED_HOSTS: readonly string[] = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
];

function normaliseHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isHostAllowed(hostname: string): boolean {
  const host = normaliseHostname(hostname);
  return ALLOWED_EMBED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith("." + allowed),
  );
}

function safeUrl(input: string): URL | null {
  try {
    const u = new URL(input.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u;
  } catch {
    return null;
  }
}

function parseYouTube(u: URL): ParsedEmbed | null {
  const host = normaliseHostname(u.hostname);
  let id: string | null = null;

  if (host === "youtu.be") {
    id = u.pathname.replace(/^\/+/, "").split("/")[0] || null;
  } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    if (u.pathname === "/watch") {
      id = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.split("/")[2] || null;
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/")[2] || null;
    }
  }

  if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;

  return {
    provider: "youtube",
    url: u.toString(),
    id,
    embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(id)}`,
  };
}

function parseVimeo(u: URL): ParsedEmbed | null {
  // Accept https://vimeo.com/<id> and https://player.vimeo.com/video/<id>
  const host = normaliseHostname(u.hostname);
  if (host !== "vimeo.com" && !host.endsWith(".vimeo.com")) return null;

  const parts = u.pathname.split("/").filter(Boolean);
  // /video/123 or /123
  const maybeId = parts[0] === "video" ? parts[1] : parts[0];
  if (!maybeId || !/^\d{5,15}$/.test(maybeId)) return null;

  return {
    provider: "vimeo",
    url: u.toString(),
    id: maybeId,
    embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(maybeId)}`,
  };
}

function parseTwitter(u: URL): ParsedEmbed | null {
  // Accept a status URL, e.g. https://twitter.com/user/status/12345 or x.com equivalent.
  const host = normaliseHostname(u.hostname);
  if (host !== "twitter.com" && host !== "x.com") return null;

  const match = u.pathname.match(/\/[^/]+\/status\/(\d{5,25})/);
  if (!match) return null;
  const id = match[1];

  // Twitter's supported iframe embed endpoint.
  return {
    provider: "twitter",
    url: u.toString(),
    id,
    embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${encodeURIComponent(
      id,
    )}`,
  };
}

function parseLinkedIn(u: URL): ParsedEmbed | null {
  // Accept canonical embed URL: https://www.linkedin.com/embed/feed/update/<urn>
  const host = normaliseHostname(u.hostname);
  if (host !== "linkedin.com") return null;

  const match = u.pathname.match(/^\/embed\/feed\/update\/([A-Za-z0-9:_-]{5,200})\/?$/);
  if (!match) return null;
  const id = match[1];

  return {
    provider: "linkedin",
    url: u.toString(),
    id,
    embedUrl: `https://www.linkedin.com/embed/feed/update/${encodeURIComponent(
      id,
    )}`,
  };
}

/**
 * Parse a user-supplied URL into a structured embed descriptor.
 * Returns `null` if the URL is invalid, non-https-capable, or not in the allowlist.
 */
export function parseEmbedUrl(input: string): ParsedEmbed | null {
  const u = safeUrl(input);
  if (!u) return null;
  if (!isHostAllowed(u.hostname)) return null;

  return (
    parseYouTube(u) ||
    parseVimeo(u) ||
    parseTwitter(u) ||
    parseLinkedIn(u) ||
    null
  );
}

/**
 * Validate that an already-stored embed descriptor still resolves to an
 * allowlisted provider. Used defensively when rendering stored content.
 */
export function isValidParsedEmbed(value: unknown): value is ParsedEmbed {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ParsedEmbed>;
  if (!v.provider || !v.url || !v.embedUrl || !v.id) return false;
  const reparsed = parseEmbedUrl(v.url);
  return reparsed !== null && reparsed.provider === v.provider;
}

export const EMBED_PROVIDER_LABELS: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

/**
 * Sandbox tokens applied to every embed iframe.
 * Intentionally omits `allow-top-navigation` and `allow-downloads`.
 */
export const EMBED_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-presentation";
