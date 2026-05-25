import { NextRequest, NextResponse } from "next/server";
import { consumeAuthCode } from "@/lib/authCodes";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const grantType = params.get("grant_type");
  const code = params.get("code");

  if (grantType !== "authorization_code" || !code) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const accessToken = consumeAuthCode(code);
  if (!accessToken) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  return NextResponse.json({
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
  });
}
