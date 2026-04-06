import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight health endpoint for uptime monitors (Better Stack, Vercel
// health checks, external probes). Returns 200 when the process is up
// and can round-trip a trivial query to Postgres; 503 otherwise.
//
// Intentionally does NOT:
//   - touch any user data
//   - require auth (it must be callable by anonymous probes)
//   - log or retain caller information
//
// Consumers should treat the JSON body as diagnostic only. The status
// code is the contract.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type HealthBody = {
  status: "ok" | "degraded";
  uptime: number;
  timestamp: string;
  checks: {
    database: "ok" | "fail";
  };
  version: string | null;
};

export async function GET() {
  const startedAt = Date.now();
  let databaseOk = false;

  try {
    // `SELECT 1` round-trip — minimal load, confirms the pool is alive
    // and migrations have at least bootstrapped the connection.
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch {
    databaseOk = false;
  }

  const body: HealthBody = {
    status: databaseOk ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      database: databaseOk ? "ok" : "fail",
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  };

  return NextResponse.json(body, {
    status: databaseOk ? 200 : 503,
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=30",
      "X-Health-Check-Duration-Ms": String(Date.now() - startedAt),
    },
  });
}
