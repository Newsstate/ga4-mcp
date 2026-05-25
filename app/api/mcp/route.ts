import { NextRequest, NextResponse } from "next/server";
import { getTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id",
};

function getAppUrl(req: NextRequest): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`
  );
}

const TOOLS_LIST = [
  { name: "list_properties", description: "List all GA4 properties accessible by the authenticated user.", inputSchema: { type: "object", properties: {} } },
  { name: "run_report", description: "Run a GA4 analytics report for a date range.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, metrics: { type: "array", items: { type: "string" } }, dimensions: { type: "array", items: { type: "string" } }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
  { name: "run_realtime_report", description: "Get realtime active users in the last 30 minutes.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, metrics: { type: "array", items: { type: "string" } } }, required: ["propertyId"] } },
  { name: "get_top_pages", description: "Get top pages by page views.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
  { name: "get_traffic_sources", description: "Breakdown of sessions by traffic source and medium.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
  { name: "get_audience_overview", description: "Get audience demographics: country, device, browser.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, groupBy: { type: "string", enum: ["country", "deviceCategory", "browser", "operatingSystem"] } }, required: ["propertyId"] } },
  { name: "get_events", description: "Get event counts for a date range.", inputSchema: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
  { name: "list_search_console_sites", description: "List all websites verified in Google Search Console.", inputSchema: { type: "object", properties: {} } },
  { name: "get_search_queries", description: "Get top search queries from Google Search Console with clicks, impressions, CTR and position.", inputSchema: { type: "object", properties: { siteUrl: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["siteUrl"] } },
  { name: "get_search_pages", description: "Get top pages from Google Search Console by clicks and impressions.", inputSchema: { type: "object", properties: { siteUrl: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["siteUrl"] } },
  { name: "get_search_performance", description: "Get daily search performance trend from Google Search Console.", inputSchema: { type: "object", properties: { siteUrl: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["siteUrl"] } },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const appUrl = getAppUrl(req);

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "GA4 Analytics MCP", version: "1.0.0" },
        tools: TOOLS_LIST,
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

  const authHeader = req.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

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

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  if (method === "tools/list") {
    return NextResponse.json(
      { jsonrpc: "2.0", result: { tools: TOOLS_LIST }, id },
      { headers: CORS_HEADERS }
    );
  }

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

  try {
    const result = await handleToolCall(
      method,
      (params as { name?: string; arguments?: Record<string, unknown> }) ?? {},
      appUrl,
      bearerToken
    );
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
          metrics: (args.metrics as string[]) ?? ["sessions", "activeUsers"],
          dimensions: args.dimensions as string[],
          startDate: (args.startDate as string) ?? "7daysAgo",
          endDate: (args.endDate as string) ?? "today",
          limit: (args.limit as number) ?? 100,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "run_realtime_report": {
        const data = await runGA4RealtimeReport(authClient, {
          propertyId: args.propertyId as string,
          metrics: (args.metrics as string[]) ?? ["activeUsers"],
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "get_top_pages": {
        const data = await runGA4Report(authClient, {
          propertyId: args.propertyId as string,
          startDate: (args.startDate as string) ?? "7daysAgo",
          endDate: (args.endDate as string) ?? "today",
          metrics: ["screenPageViews", "sessions", "bounceRate", "averageSessionDuration"],
          dimensions: ["pagePath", "pageTitle"],
          limit: (args.limit as number) ?? 10,
          orderByMetric: "screenPageViews",
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "get_traffic_sources": {
        const data = await runGA4Report(authClient, {
          propertyId: args.propertyId as string,
          startDate: (args.startDate as string) ?? "30daysAgo",
          endDate: (args.endDate as string) ?? "today",
          metrics: ["sessions", "activeUsers", "bounceRate"],
          dimensions: ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium"],
          limit: (args.limit as number) ?? 20,
          orderByMetric: "sessions",
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "get_audience_overview": {
        const data = await runGA4Report(authClient, {
          propertyId: args.propertyId as string,
          startDate: (args.startDate as string) ?? "30daysAgo",
          endDate: (args.endDate as string) ?? "today",
          metrics: ["activeUsers", "sessions", "newUsers"],
          dimensions: [(args.groupBy as string) ?? "country"],
          limit: 20,
          orderByMetric: "activeUsers",
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "get_events": {
        const data = await runGA4Report(authClient, {
          propertyId: args.propertyId as string,
          startDate: (args.startDate as string) ?? "7daysAgo",
          endDate: (args.endDate as string) ?? "today",
          metrics: ["eventCount", "eventCountPerUser", "totalUsers"],
          dimensions: ["eventName"],
          limit: (args.limit as number) ?? 25,
          orderByMetric: "eventCount",
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      case "list_search_console_sites": {
        const { listSearchConsoleSites } = await import("@/lib/searchconsole");
        const sites = await listSearchConsoleSites(authClient);
        return { content: [{ type: "text", text: JSON.stringify(sites, null, 2) }] };
      }
      case "get_search_queries":
      case "get_search_pages":
      case "get_search_performance": {
        const { querySearchAnalytics } = await import("@/lib/searchconsole");
        const dimensionMap: Record<string, ("query" | "page" | "date")[]> = {
          get_search_queries: ["query"],
          get_search_pages: ["page"],
          get_search_performance: ["date"],
        };
        const data = await querySearchAnalytics(authClient, {
          siteUrl: args.siteUrl as string,
          startDate: (args.startDate as string) ?? "28daysAgo",
          endDate: (args.endDate as string) ?? "today",
          dimensions: dimensionMap[toolName],
          rowLimit: (args.limit as number) ?? 25,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (err: unknown) {
    return { content: [{ type: "text", text: `❌ ${(err as Error).message}` }], isError: true };
  }
}
