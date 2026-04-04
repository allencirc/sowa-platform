import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSyncStatus } from "@/lib/hubspot";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = getSyncStatus();
  return NextResponse.json(status);
}
