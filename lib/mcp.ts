import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  listGA4Properties,
  runGA4Report,
  runGA4RealtimeReport,
} from "./ga4";
import { getAuthenticatedClient } from "./google";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireAuth() {
  return getAuthenticatedClient();
}

function errorResponse(message: string) {
  return {
    content: [{ type: "text" as const, text: `❌ ${message}` }],
    isError: true,
  };
}

function jsonResponse(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

// ─── Build MCP server ─────────────────────────────────────────────────────────

export function buildMCPServer(appUrl: string): McpServer {
  const server = new McpServer({
    name: "GA4 Analytics MCP",
    version: "1.0.0",
  });

  // ── Tool: list_properties ──────────────────────────────────────────────────
  server.tool(
    "list_properties",
    "List all Google Analytics 4 properties accessible by the authenticated user.",
    {},
    async () => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(
          `Not authenticated. Please sign in at ${appUrl} first.`
        );

      try {
        const properties = await listGA4Properties(auth);
        return jsonResponse({ properties });
      } catch (err: unknown) {
        return errorResponse(
          `Failed to list properties: ${(err as Error).message}`
        );
      }
    }
  );

  // ── Tool: run_report ───────────────────────────────────────────────────────
  server.tool(
    "run_report",
    "Run a GA4 analytics report for a date range. Returns dimensions and metrics.",
    {
      propertyId: z
        .string()
        .describe(
          'GA4 property ID, e.g. "123456789" or "properties/123456789"'
        ),
      startDate: z
        .string()
        .default("7daysAgo")
        .describe('Start date: "7daysAgo", "30daysAgo", or "YYYY-MM-DD"'),
      endDate: z
        .string()
        .default("today")
        .describe('End date: "today" or "YYYY-MM-DD"'),
      metrics: z
        .array(z.string())
        .default(["sessions", "activeUsers", "screenPageViews"])
        .describe(
          'Metrics to retrieve, e.g. ["sessions","activeUsers","bounceRate"]'
        ),
      dimensions: z
        .array(z.string())
        .optional()
        .describe('Dimensions to group by, e.g. ["date","country","deviceCategory"]'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10000)
        .default(100)
        .describe("Maximum number of rows to return (1-10000)"),
      orderByMetric: z
        .string()
        .optional()
        .describe("Sort results descending by this metric name"),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(
          `Not authenticated. Please sign in at ${appUrl} first.`
        );

      try {
        const result = await runGA4Report(auth, {
          propertyId: args.propertyId,
          startDate: args.startDate,
          endDate: args.endDate,
          metrics: args.metrics,
          dimensions: args.dimensions,
          limit: args.limit,
          orderByMetric: args.orderByMetric,
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Report failed: ${(err as Error).message}`);
      }
    }
  );

  // ── Tool: run_realtime_report ──────────────────────────────────────────────
  server.tool(
    "run_realtime_report",
    "Get real-time analytics data showing active users in the last 30 minutes.",
    {
      propertyId: z
        .string()
        .describe('GA4 property ID, e.g. "123456789"'),
      metrics: z
        .array(z.string())
        .default(["activeUsers"])
        .describe('Realtime metrics, e.g. ["activeUsers","eventCount"]'),
      dimensions: z
        .array(z.string())
        .optional()
        .describe('Dimensions, e.g. ["country","deviceCategory","unifiedScreenName"]'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(50)
        .describe("Maximum number of rows (1-200)"),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(
          `Not authenticated. Please sign in at ${appUrl} first.`
        );

      try {
        const result = await runGA4RealtimeReport(auth, {
          propertyId: args.propertyId,
          metrics: args.metrics,
          dimensions: args.dimensions,
          limit: args.limit,
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Realtime report failed: ${(err as Error).message}`);
      }
    }
  );

  // ── Tool: get_top_pages ────────────────────────────────────────────────────
  server.tool(
    "get_top_pages",
    "Get the top pages by page views for a date range.",
    {
      propertyId: z.string().describe("GA4 property ID"),
      startDate: z.string().default("7daysAgo"),
      endDate: z.string().default("today"),
      limit: z.number().int().min(1).max(100).default(10),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(`Not authenticated. Sign in at ${appUrl} first.`);

      try {
        const result = await runGA4Report(auth, {
          propertyId: args.propertyId,
          startDate: args.startDate,
          endDate: args.endDate,
          metrics: ["screenPageViews", "sessions", "bounceRate", "averageSessionDuration"],
          dimensions: ["pagePath", "pageTitle"],
          limit: args.limit,
          orderByMetric: "screenPageViews",
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Failed: ${(err as Error).message}`);
      }
    }
  );

  // ── Tool: get_traffic_sources ──────────────────────────────────────────────
  server.tool(
    "get_traffic_sources",
    "Breakdown of sessions by traffic source / medium.",
    {
      propertyId: z.string().describe("GA4 property ID"),
      startDate: z.string().default("30daysAgo"),
      endDate: z.string().default("today"),
      limit: z.number().int().min(1).max(100).default(20),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(`Not authenticated. Sign in at ${appUrl} first.`);

      try {
        const result = await runGA4Report(auth, {
          propertyId: args.propertyId,
          startDate: args.startDate,
          endDate: args.endDate,
          metrics: ["sessions", "activeUsers", "bounceRate", "conversions"],
          dimensions: ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium"],
          limit: args.limit,
          orderByMetric: "sessions",
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Failed: ${(err as Error).message}`);
      }
    }
  );

  // ── Tool: get_audience_overview ────────────────────────────────────────────
  server.tool(
    "get_audience_overview",
    "Get audience demographics: country, device, browser breakdown.",
    {
      propertyId: z.string().describe("GA4 property ID"),
      startDate: z.string().default("30daysAgo"),
      endDate: z.string().default("today"),
      groupBy: z
        .enum(["country", "deviceCategory", "browser", "operatingSystem"])
        .default("country")
        .describe("Dimension to group by"),
      limit: z.number().int().min(1).max(100).default(20),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(`Not authenticated. Sign in at ${appUrl} first.`);

      try {
        const result = await runGA4Report(auth, {
          propertyId: args.propertyId,
          startDate: args.startDate,
          endDate: args.endDate,
          metrics: ["activeUsers", "sessions", "newUsers"],
          dimensions: [args.groupBy],
          limit: args.limit,
          orderByMetric: "activeUsers",
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Failed: ${(err as Error).message}`);
      }
    }
  );

  // ── Tool: get_events ───────────────────────────────────────────────────────
  server.tool(
    "get_events",
    "Get event counts for a date range.",
    {
      propertyId: z.string().describe("GA4 property ID"),
      startDate: z.string().default("7daysAgo"),
      endDate: z.string().default("today"),
      limit: z.number().int().min(1).max(100).default(25),
    },
    async (args) => {
      const auth = await requireAuth();
      if (!auth)
        return errorResponse(`Not authenticated. Sign in at ${appUrl} first.`);

      try {
        const result = await runGA4Report(auth, {
          propertyId: args.propertyId,
          startDate: args.startDate,
          endDate: args.endDate,
          metrics: ["eventCount", "eventCountPerUser", "totalUsers"],
          dimensions: ["eventName"],
          limit: args.limit,
          orderByMetric: "eventCount",
        });
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Failed: ${(err as Error).message}`);
      }
    }
  );

  return server;
}
