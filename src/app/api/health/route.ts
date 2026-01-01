import { NextResponse } from "next/server";

/**
 * Health check endpoint for online status detection
 * Returns 200 if the server is reachable
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
