import { NextRequest, NextResponse } from "next/server";
import { getTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tokens = getTokenCookie();
  const appUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  return NextResponse.json({
    status: "ok",
    service: "GA4 MCP Server",
    version: "1.0.0",
    authenticated: !!tokens,
    mcpEndpoint: `${appUrl}/api/mcp`,
    timestamp: new Date().toISOString(),
  });
}
