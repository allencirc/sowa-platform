import { NextRequest, NextResponse } from "next/server";
import { type ZodIssue, type ZodSchema } from "zod";
import { ZodError } from "zod";
import { checkRateLimit } from "./rate-limit";

/**
 * Extract a stable identifier from the request for rate limiting.
 */
function getClientId(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Apply rate limiting. Returns a 429 response if exceeded, null otherwise.
 */
export function applyRateLimit(request: NextRequest): NextResponse | null {
  const clientId = getClientId(request);
  const result = checkRateLimit(clientId);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}

/**
 * Parse and validate request body against a Zod schema.
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  try {
    const data = schema.parse(raw);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: err.issues.map((e: ZodIssue) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        ),
      };
    }
    throw err;
  }
}

/**
 * Parse and validate query params from a URL against a Zod schema.
 */
export function parseQuery<T>(
  url: URL,
  schema: ZodSchema<T>,
): { data: T; error?: never } | { data?: never; error: NextResponse } {
  const raw: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  try {
    const data = schema.parse(raw);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: NextResponse.json(
          {
            error: "Invalid query parameters",
            details: err.issues.map((e: ZodIssue) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        ),
      };
    }
    throw err;
  }
}

/**
 * Standard error response for caught exceptions.
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard paginated response wrapper.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
