import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/google";
import { setTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory store for auth codes (use Vercel KV in production)
const authCodeStore = new Map<string, string>(); // code → access_token

export function storeAuthCode(code: string, accessToken: string) {
  authCodeStore.set(code, accessToken);
  // Auto-expire after 5 minutes
  setTimeout(() => authCodeStore.delete(code), 5 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const grantType = params.get("grant_type");
  const code = params.get("code");

  if (grantType !== "authorization_code" || !code) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const accessToken = authCodeStore.get(code);
  if (!accessToken) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  authCodeStore.delete(code);

  return NextResponse.json({
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
  });
}
