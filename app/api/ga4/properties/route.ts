import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/google";
import { listGA4Properties } from "@/lib/ga4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const properties = await listGA4Properties(auth);
    return NextResponse.json({ properties });
  } catch (err: unknown) {
    console.error("[ga4/properties] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
