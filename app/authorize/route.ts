import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const state = searchParams.get("state") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? "";

  // Encode both state and redirectUri so we can recover them in the callback
  const combinedState = Buffer.from(
    JSON.stringify({ state, redirectUri })
  ).toString("base64");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXTAUTH_URL}/api/auth/callback`
  );
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set(
    "scope",
    [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ].join(" ")
  );

  // ✅ FIX: was "access_token_type" (invalid) — must be "access_type"
  // This is required to receive a refresh_token from Google
  googleAuthUrl.searchParams.set("access_type", "offline");

  googleAuthUrl.searchParams.set("prompt", "consent"); // forces refresh_token every time
  googleAuthUrl.searchParams.set("state", combinedState);

  return NextResponse.redirect(googleAuthUrl.toString());
}
