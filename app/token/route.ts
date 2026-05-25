import { NextRequest, NextResponse } from "next/server";
import { consumeAuthCode } from "@/lib/authCodes"; // ← use the store

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const grantType = params.get("grant_type");
  const code = params.get("code");

  if (grantType !== "authorization_code" || !code) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: CORS });
  }

  // ✅ FIX: Look up the real access token from the in-memory store
  const accessToken = consumeAuthCode(code);
  if (!accessToken) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400, headers: CORS });
  }

  return NextResponse.json(
    { access_token: accessToken, token_type: "bearer", expires_in: 3600 },
    { headers: CORS }
  );
}
