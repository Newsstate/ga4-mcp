import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  
  // Forward Claude's PKCE params to Google
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/callback`);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  
  // Pass Claude's state through so we can return it
  const state = searchParams.get("state") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? "";
  
  // Store Claude's redirect_uri and state in our state param
  const combinedState = Buffer.from(JSON.stringify({ state, redirectUri })).toString("base64");
  googleAuthUrl.searchParams.set("state", combinedState);

  return NextResponse.redirect(googleAuthUrl.toString());
}
