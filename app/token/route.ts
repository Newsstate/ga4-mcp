import { NextRequest, NextResponse } from "next/server";
import { consumeAuthCode } from "@/lib/authCodes"; // ✅ FIX: read from the code store

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const grantType = params.get("grant_type");
  const code = params.get("code");

  if (grantType !== "authorization_code" || !code) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "grant_type must be authorization_code and code is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ✅ FIX: Look up the real Google access token using the temp hex code.
  // The /api/auth/callback route stored it here via storeAuthCode().
  // Old broken code tried to base64-decode the hex code — that never worked.
  const accessToken = consumeAuthCode(code);

  if (!accessToken) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Code not found or already used. Please re-authenticate." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 3600,
    },
    { headers: CORS_HEADERS }
  );
}
