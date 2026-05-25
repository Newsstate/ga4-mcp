import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/google";
import { setTokenCookie } from "@/lib/auth";
import { storeAuthCode } from "@/lib/authCodes"; // ✅ FIX: import the code store
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const rawState = searchParams.get("state") ?? "";

  const appUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  let claudeRedirectUri = "";
  let claudeState = "";
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64").toString());
    claudeRedirectUri = parsed.redirectUri ?? "";
    claudeState = parsed.state ?? "";
  } catch {}

  if (error) {
    if (claudeRedirectUri) {
      return NextResponse.redirect(
        `${claudeRedirectUri}?error=${encodeURIComponent(error)}&state=${claudeState}`
      );
    }
    return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}?error=missing_code`);
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Always persist tokens in HttpOnly cookie for browser-based sessions
    setTokenCookie({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      token_type: tokens.token_type ?? undefined,
      scope: tokens.scope ?? undefined,
    });

    // ── Claude.ai OAuth flow ──────────────────────────────────────────────────
    if (claudeRedirectUri) {
      const tempCode = crypto.randomBytes(32).toString("hex");

      // ✅ FIX: Store the access token in the in-memory store (NOT a cookie).
      // The /app/token/route.ts endpoint will look it up by this tempCode.
      storeAuthCode(tempCode, tokens.access_token!);

      // Redirect back to Claude with the temp code
      return NextResponse.redirect(
        `${claudeRedirectUri}?code=${tempCode}&state=${claudeState}`
      );
    }

    // ── Normal browser login ──────────────────────────────────────────────────
    return NextResponse.redirect(`${appUrl}?auth=success`);

  } catch (err: unknown) {
    console.error("[auth/callback] Token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
  }
}
