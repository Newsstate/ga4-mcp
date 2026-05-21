import { NextRequest, NextResponse } from "next/server";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildMCPServer } from "@/lib/mcp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getAppUrl(req: NextRequest): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, mcp-session-id",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const appUrl = getAppUrl(req);
    const mcpServer = buildMCPServer(appUrl);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — each request is independent
    });

    await mcpServer.connect(transport);

    const body = await req.json();
   const headers: Record<string, string> = {};
req.headers.forEach((value, key) => {
  headers[key] = value;
});

let response: unknown;
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response = await (transport as any).handleRequest(body, { headers });
} catch {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response = await (transport as any).handleRequest(body, headers);
}

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    console.error("[mcp] Error handling request:", err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
          data: (err as Error).message,
        },
        id: null,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Return MCP server info for discovery
  const appUrl = getAppUrl(req);
  return NextResponse.json({
    name: "GA4 Analytics MCP",
    version: "1.0.0",
    description:
      "Model Context Protocol server for Google Analytics 4. Authenticate at the app URL, then connect Claude to this endpoint.",
    serverUrl: `${appUrl}/api/mcp`,
    authUrl: `${appUrl}/api/auth/google`,
    tools: [
      "list_properties",
      "run_report",
      "run_realtime_report",
      "get_top_pages",
      "get_traffic_sources",
      "get_audience_overview",
      "get_events",
    ],
  });
}
