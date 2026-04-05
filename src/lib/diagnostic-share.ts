/**
 * URL-serialisable diagnostic answers.
 *
 * A completed assessment can be fully reconstructed from a single short
 * URL query param so users can share their profile with a mentor,
 * employer, or funding advisor. Nothing is persisted server-side — the
 * URL is the entire store.
 *
 * Payload shape (JSON before base64url):
 *   { v: <schemaVersion>, a: { [questionId]: string | string[] } }
 *
 * Versioning: if the question set changes in a way that would make old
 * answers score incorrectly, bump SCHEMA_VERSION. Decoders will surface
 * a friendly "incompatible" result instead of silently producing
 * nonsense.
 */
export const SCHEMA_VERSION = 1;

export type AnswerSet = Record<string, string | string[]>;

export interface DecodeIncompatible {
  ok: false;
  reason: "incompatible_version" | "malformed" | "empty";
  version?: number;
}

export interface DecodeSuccess {
  ok: true;
  version: number;
  answers: AnswerSet;
}

export type DecodeResult = DecodeSuccess | DecodeIncompatible;

export type ResultsTab = "gaps" | "roles";

export function isResultsTab(v: unknown): v is ResultsTab {
  return v === "gaps" || v === "roles";
}

/**
 * Base64url (RFC 4648 §5) encode a UTF-8 string. No padding, URL-safe
 * characters only. Works in both Node and browser environments.
 */
function base64urlEncode(input: string): string {
  let b64: string;
  if (typeof Buffer !== "undefined") {
    b64 = Buffer.from(input, "utf8").toString("base64");
  } else {
    // Browser fallback — btoa only handles Latin-1, so round-trip UTF-8.
    const bytes = new TextEncoder().encode(input);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    b64 = btoa(bin);
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * Encode an answer set into a URL-safe string. Uses short keys and
 * strips empty/undefined entries to stay under ~300 chars for a typical
 * 12-question assessment.
 */
export function encodeAnswers(answers: AnswerSet): string {
  const compact: AnswerSet = {};
  for (const [qid, val] of Object.entries(answers)) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string") {
      if (val === "") continue;
      compact[qid] = val;
    } else if (Array.isArray(val)) {
      if (val.length === 0) continue;
      compact[qid] = val.filter((v) => typeof v === "string" && v !== "");
    }
  }
  const payload = { v: SCHEMA_VERSION, a: compact };
  return base64urlEncode(JSON.stringify(payload));
}

/**
 * Decode a share param back into an answer set. Never throws — always
 * returns a discriminated union so callers can render a friendly error.
 */
export function decodeAnswers(param: string | null | undefined): DecodeResult {
  if (!param) return { ok: false, reason: "empty" };
  let json: string;
  try {
    json = base64urlDecode(param);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, reason: "malformed" };
  }

  const obj = parsed as { v?: unknown; a?: unknown };
  const version = typeof obj.v === "number" ? obj.v : NaN;
  if (!Number.isFinite(version)) {
    return { ok: false, reason: "malformed" };
  }
  if (version !== SCHEMA_VERSION) {
    return { ok: false, reason: "incompatible_version", version };
  }

  if (!obj.a || typeof obj.a !== "object" || Array.isArray(obj.a)) {
    return { ok: false, reason: "malformed" };
  }

  const rawAnswers = obj.a as Record<string, unknown>;
  const answers: AnswerSet = {};
  for (const [qid, val] of Object.entries(rawAnswers)) {
    if (typeof val === "string") {
      answers[qid] = val;
    } else if (Array.isArray(val)) {
      const strs = val.filter((x): x is string => typeof x === "string");
      if (strs.length > 0) answers[qid] = strs;
    }
  }

  return { ok: true, version, answers };
}

/**
 * Build the canonical share URL for a results page. Takes the caller's
 * locale prefix so the link works from any localised route.
 */
export function buildShareUrl(
  origin: string,
  localePrefix: string,
  answers: AnswerSet,
  tab: ResultsTab = "gaps"
): string {
  const encoded = encodeAnswers(answers);
  const cleanOrigin = origin.replace(/\/$/, "");
  const cleanLocale = localePrefix ? `/${localePrefix.replace(/^\/|\/$/g, "")}` : "";
  return `${cleanOrigin}${cleanLocale}/diagnostic/assessment/results?a=${encoded}&tab=${tab}`;
}
