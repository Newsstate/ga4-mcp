import { NextRequest, NextResponse } from "next/server";
import { buildMCPServer } from "@/lib/mcp";
import { getAuthenticatedClient } from "@/lib/google";
import { getTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, mcp-session-id",
};

function getAppUrl(req: NextRequest): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const appUrl = getAppUrl(req);

  // Claude.ai reads WWW-Authenticate to discover OAuth endpoints
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "GA4 Analytics MCP", version: "1.0.0" },
      },
      id: 0,
    },
    {
      headers: {
        ...CORS_HEADERS,
        "WWW-Authenticate": [
          `Bearer realm="${appUrl}"`,
          `authorization_uri="${appUrl}/authorize"`,
          `token_uri="${appUrl}/token"`,
        ].join(", "),
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const appUrl = getAppUrl(req);

  // Check Bearer token from Claude OR cookie from browser
  const authHeader = req.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // If Bearer token present, verify it's a valid Google access token
  let isAuthenticated = false;
  if (bearerToken) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${bearerToken}`
      );
      isAuthenticated = res.ok;
    } catch {
      isAuthenticated = false;
    }
  } else {
    // Fallback: cookie-based auth (browser usage)
    const tokens = getTokenCookie();
    isAuthenticated = !!tokens;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { method, id, params } = body as {
    method: string;
    id: unknown;
    params?: unknown;
  };

  // Handle initialize without auth
  if (method === "initialize") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "GA4 Analytics MCP", version: "1.0.0" },
        },
        id,
      },
      { headers: CORS_HEADERS }
    );
  }

  // Handle tools/list without auth
  if (method === "tools/list") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        result: {
          tools: [
            { name: "list_properties", description: "List all GA4 properties", inputSchema: { type: "object", properties: {} } },
            { name: "run_report", description: "Run a GA4 analytics report", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, metrics: { type: "array", items: { type: "string" } }, dimensions: { type: "array", items: { type: "string" } }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } },
            { name: "run_realtime_report", description: "Get realtime active users", inputSchema: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
            { name: "get_top_pages", description: "Get top pages by views", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
            { name: "get_traffic_sources", description: "Get traffic sources", inputSchema: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
            { name: "get_audience_overview", description: "Get audience overview", inputSchema: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
            { name: "get_events", description: "Get event data", inputSchema: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
          ],
        },
        id,
      },
      { headers: CORS_HEADERS }
    );
  }

  // All other tool calls require auth
  if (!isAuthenticated) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Unauthorized — please authenticate first" },
        id,
      },
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          "WWW-Authenticate": `Bearer realm="${appUrl}", authorization_uri="${appUrl}/authorize", token_uri="${appUrl}/token"`,
        },
      }
    );
  }

  // Authenticated tool calls — delegate to MCP server
  try {
    const mcpServer = buildMCPServer(appUrl);
    // Use the bearer token to set credentials if available
    // Tool execution happens via lib/mcp.ts which calls getAuthenticatedClient()
    const result = await handleToolCall(method, (params as { name?: string; arguments?: Record<string, unknown> }) ?? {}, appUrl, bearerToken);
    return NextResponse.json(
      { jsonrpc: "2.0", result, id },
      { headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: (err as Error).message },
        id,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

async function handleToolCall(
  method: string,
  params: { name?: string; arguments?: Record<string, unknown> },
  appUrl: string,
  bearerToken: string | null
) {
  if (method !== "tools/call") {
    return { content: [{ type: "text", text: `Unknown method: ${method}` }] };
  }

  const { listGA4Properties, runGA4Report, runGA4RealtimeReport } = await import("@/lib/ga4");
  const { google } = await import("googleapis");

  // Build auth client from bearer token or cookie
  let authClient;
  if (bearerToken) {
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: bearerToken });
    authClient = oauth2;
  } else {
    const { getAuthenticatedClient } = await import("@/lib/google");
    authClient = await getAuthenticatedClient();
  }

  if (!authClient) {
    return { content: [{ type: "text", text: `❌ Not authenticated. Visit ${appUrl} to sign in.` }], isError: true };
  }

  const toolName = params.name;
  const args = params.arguments ?? {};

  try {
    switch (toolName) {
      case "list_properties": {
        const props = await listGA4Properties(authClient);
        return { content: [{ type: "text", text: JSON.stringify(props, null, 2) }] };
      }
    case "run_report": {
  const data = await runGA4Report(authClient, {
    propertyId: args.propertyId as string,
    metrics: args.metrics as string[],
    dimensions: args.dimensions as string[],
    startDate: args.startDate as string,
    endDate: args.endDate as string,
  });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "run_realtime_report": {
        const data = await runGA4RealtimeReport(authClient, args.propertyId as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (err: unknown) {
    return { content: [{ type: "text", text: `❌ ${(err as Error).message}` }], isError: true };
  }
}
