import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if secret is set
    const hasAuthSecret = !!process.env.AUTH_SECRET;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasDbUrl = !!process.env.DATABASE_URL;

    // Check if we can connect to the database
    let dbConnected = false;
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      dbConnected = true;
    } catch (e) {
      dbConnected = false;
    }

    // Check session
    let session = null;
    try {
      session = await auth();
    } catch (e) {
      session = { error: String(e) };
    }

    return NextResponse.json({
      env: {
        hasAuthSecret,
        hasNextAuthSecret,
        hasDbUrl,
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL ?? "not set",
      },
      db: {
        connected: dbConnected,
        userCount,
      },
      session: session ? { user: session.user } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
