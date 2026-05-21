import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  clearTokenCookie();
  return NextResponse.json({ ok: true });
}
