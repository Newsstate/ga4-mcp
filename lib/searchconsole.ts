import { google } from "googleapis";
import type { OAuth2Client } from "googleapis-common";

export interface SearchAnalyticsRequest {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: ("query" | "page" | "country" | "device" | "date")[];
  rowLimit?: number;
  startRow?: number;
}

export interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// ─── List verified sites ──────────────────────────────────────────────────────

export async function listSearchConsoleSites(authClient: OAuth2Client) {
  const sc = google.webmasters({ version: "v3", auth: authClient });
  const res = await sc.sites.list();
  return (res.data.siteEntry ?? []).map((s) => ({
    siteUrl: s.siteUrl ?? "",
    permissionLevel: s.permissionLevel ?? "",
  }));
}

// ─── Search analytics query ───────────────────────────────────────────────────

export async function querySearchAnalytics(
  authClient: OAuth2Client,
  req: SearchAnalyticsRequest
): Promise<{ rows: SearchConsoleRow[]; rowCount: number }> {
  const sc = google.webmasters({ version: "v3", auth: authClient });

  const res = await sc.searchanalytics.query({
    siteUrl: req.siteUrl,
    requestBody: {
      startDate: req.startDate,
      endDate: req.endDate,
      dimensions: req.dimensions ?? ["query"],
      rowLimit: req.rowLimit ?? 25,
      startRow: req.startRow ?? 0,
    },
  });

  const rows = (res.data.rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: Math.round((r.ctr ?? 0) * 10000) / 100, // as percentage
    position: Math.round((r.position ?? 0) * 10) / 10,
  }));

  return { rows, rowCount: rows.length };
}
