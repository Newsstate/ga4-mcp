import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/google";
import { setTokenCookie } from "@/lib/auth";

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

  // Parse state — may contain Claude's redirect_uri and state
  let claudeRedirectUri = "";
  let claudeState = "";
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64").toString());
    claudeRedirectUri = parsed.redirectUri ?? "";
    claudeState = parsed.state ?? "";
  } catch {
    // Not a Claude OAuth flow, plain Google login — ignore
  }

  if (error) {
    console.error("[auth/callback] OAuth error:", error);
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

    setTokenCookie({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      token_type: tokens.token_type ?? undefined,
      scope: tokens.scope ?? undefined,
    });

    // If this was triggered by Claude.ai, redirect back to Claude
    if (claudeRedirectUri) {
      return NextResponse.redirect(
        `${claudeRedirectUri}?code=AUTHED&state=${claudeState}`
      );
    }

    // Normal browser login
    return NextResponse.redirect(`${appUrl}?auth=success`);
  } catch (err: unknown) {
    console.error("[auth/callback] Token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
  }
}
