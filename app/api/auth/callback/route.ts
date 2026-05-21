import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/google";
import { setTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (error) {
    console.error("[auth/callback] OAuth error:", error);
    return NextResponse.redirect(
      `${appUrl}?error=${encodeURIComponent(error)}`
    );
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

    return NextResponse.redirect(`${appUrl}?auth=success`);
  } catch (err: unknown) {
    console.error("[auth/callback] Token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
  }
}
