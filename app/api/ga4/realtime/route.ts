import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/google";
import { runGA4RealtimeReport } from "@/lib/ga4";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json(
      { error: "propertyId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await runGA4RealtimeReport(auth, {
      propertyId,
      metrics: ["activeUsers"],
      dimensions: ["country", "deviceCategory", "unifiedScreenName"],
      limit: 50,
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[ga4/realtime] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
