import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * READ_ONLY mode — disaster-recovery kill switch.
 *
 * Referenced from `docs/disaster-recovery.md §4.2` (Database Corruption or
 * Accidental Delete). Setting `READ_ONLY=true` in the environment (and
 * redeploying on Vercel) must prevent any write from reaching the database
 * while recovery is in progress, without taking the site offline for readers.
 *
 * Enforcement is layered:
 *   1. `src/proxy.ts` blocks mutating HTTP methods on `/api/*` and `/admin/*`
 *      so fetch-based writes fail fast with a 503 before hitting route code.
 *   2. `assertWritable()` is called inside Server Actions and route handlers
 *      as defence in depth — the Next 16 proxy doc explicitly warns that a
 *      matcher change or a refactor can silently remove proxy coverage of
 *      Server Functions, so auth/authorisation checks must live in the
 *      handler too.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function isReadOnly(): boolean {
  const raw = process.env.READ_ONLY;
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}

/** HTTP methods that do not mutate server state. */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isMutatingMethod(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}

export const READ_ONLY_MESSAGE =
  "The platform is in read-only mode while disaster recovery is in progress. Writes are temporarily disabled.";

/**
 * JSON 503 response returned to fetch-based callers (API routes, admin UI).
 * The `Retry-After` header gives clients a conservative hint without
 * committing to an exact restore time.
 */
export function readOnlyResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "read_only_mode",
      message: READ_ONLY_MESSAGE,
    },
    {
      status: 503,
      headers: {
        "Retry-After": "300",
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Proxy-level check. Returns a 503 response when the request must be blocked,
 * otherwise `null` so the proxy can continue its normal flow.
 */
export function applyReadOnly(request: NextRequest): NextResponse | null {
  if (!isReadOnly()) return null;
  if (!isMutatingMethod(request.method)) return null;
  return readOnlyResponse();
}

/**
 * Server Action / route handler guard. Throws a tagged error that callers can
 * surface to the user. Kept deliberately simple so it is safe to call from
 * both route handlers (which can convert to a 503) and server actions (which
 * can surface the message via their returned state).
 */
export class ReadOnlyModeError extends Error {
  readonly code = "READ_ONLY_MODE";
  constructor() {
    super(READ_ONLY_MESSAGE);
    this.name = "ReadOnlyModeError";
  }
}

export function assertWritable(): void {
  if (isReadOnly()) {
    throw new ReadOnlyModeError();
  }
}
