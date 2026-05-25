import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { OAuth2Client } from "googleapis-common";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportRequest {
  propertyId: string;
  startDate: string;   // e.g. "7daysAgo" | "2024-01-01"
  endDate: string;     // e.g. "today"
  metrics: string[];   // e.g. ["sessions", "activeUsers"]
  dimensions?: string[]; // e.g. ["date", "country"]
  limit?: number;
  orderByMetric?: string;
}

export interface RealtimeRequest {
  propertyId: string;
  metrics: string[];
  dimensions?: string[];
  limit?: number;
}

export interface PropertyInfo {
  name: string;
  displayName: string;
  timeZone?: string;
  currencyCode?: string;
}

// ─── Client factory ───────────────────────────────────────────────────────────

function getGA4Client(authClient: OAuth2Client): BetaAnalyticsDataClient {
  return new BetaAnalyticsDataClient({ authClient: authClient as never });
}

// ─── List properties ──────────────────────────────────────────────────────────

export async function listGA4Properties(
  authClient: OAuth2Client
): Promise<PropertyInfo[]> {
  const { google } = await import("googleapis");
  const adminApi = google.analyticsadmin({ version: "v1beta", auth: authClient });

  // ✅ FIX 1: Use accountSummaries.list() instead of properties.list()
  // The old filter "parent:accounts/-" is NOT supported by the GA4 Admin API
  // and always throws an error. accountSummaries returns all accessible
  // properties across all accounts in a single call.
  //
  // ✅ FIX 2: Removed broken syntax — old code had:
  //   - missing ); to close flatMap
  //   - missing return statement
  //   - dead code referencing undefined variable `res`
  const adminRes = await adminApi.accountSummaries.list({});

  const properties = (adminRes.data.accountSummaries ?? []).flatMap(
    (account) =>
      (account.propertySummaries ?? []).map((p) => ({
        name: p.property ?? "",
        displayName: p.displayName ?? "",
        timeZone: undefined,     // not available in accountSummaries
        currencyCode: undefined, // not available in accountSummaries
      }))
  ); // ✅ flatMap properly closed

  return properties; // ✅ properly returned
}

// ─── Run report ───────────────────────────────────────────────────────────────

export async function runGA4Report(
  authClient: OAuth2Client,
  req: ReportRequest
) {
  const client = getGA4Client(authClient);

  const [response] = await client.runReport({
    property: `properties/${req.propertyId.replace(/^properties\//, "")}`,
    dateRanges: [{ startDate: req.startDate, endDate: req.endDate }],
    metrics: req.metrics.map((name) => ({ name })),
    dimensions: (req.dimensions ?? []).map((name) => ({ name })),
    limit: req.limit ?? 100,
    orderBys: req.orderByMetric
      ? [{ metric: { metricName: req.orderByMetric }, desc: true }]
      : undefined,
  });

  const headers = {
    dimensions: (response.dimensionHeaders ?? []).map((h) => h.name ?? ""),
    metrics: (response.metricHeaders ?? []).map((h) => h.name ?? ""),
  };

  const rows = (response.rows ?? []).map((row) => ({
    dimensions: (row.dimensionValues ?? []).map((v) => v.value ?? ""),
    metrics: (row.metricValues ?? []).map((v) => v.value ?? ""),
  }));

  return { headers, rows, rowCount: response.rowCount ?? 0 };
}

// ─── Realtime report ──────────────────────────────────────────────────────────

export async function runGA4RealtimeReport(
  authClient: OAuth2Client,
  req: RealtimeRequest
) {
  const client = getGA4Client(authClient);

  const [response] = await client.runRealtimeReport({
    property: `properties/${req.propertyId.replace(/^properties\//, "")}`,
    metrics: req.metrics.map((name) => ({ name })),
    dimensions: (req.dimensions ?? []).map((name) => ({ name })),
    limit: req.limit ?? 50,
  });

  const headers = {
    dimensions: (response.dimensionHeaders ?? []).map((h) => h.name ?? ""),
    metrics: (response.metricHeaders ?? []).map((h) => h.name ?? ""),
  };

  const rows = (response.rows ?? []).map((row) => ({
    dimensions: (row.dimensionValues ?? []).map((v) => v.value ?? ""),
    metrics: (row.metricValues ?? []).map((v) => v.value ?? ""),
  }));

  return { headers, rows, rowCount: response.rowCount ?? 0 };
}
