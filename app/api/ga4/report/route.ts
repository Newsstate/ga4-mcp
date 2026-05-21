import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/google";
import { runGA4Report } from "@/lib/ga4";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    propertyId,
    startDate = "7daysAgo",
    endDate = "today",
    metrics = ["sessions", "activeUsers"],
    dimensions,
    limit = 100,
    orderByMetric,
  } = body as Record<string, unknown>;

  if (!propertyId || typeof propertyId !== "string") {
    return NextResponse.json(
      { error: "propertyId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await runGA4Report(auth, {
      propertyId,
      startDate: String(startDate),
      endDate: String(endDate),
      metrics: Array.isArray(metrics) ? metrics.map(String) : ["sessions"],
      dimensions: Array.isArray(dimensions)
        ? dimensions.map(String)
        : undefined,
      limit: Number(limit),
      orderByMetric: orderByMetric ? String(orderByMetric) : undefined,
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[ga4/report] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
