import { NextResponse } from "next/server";
import { createOAuthClient, GA4_SCOPES } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const oauth2Client = createOAuthClient();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GA4_SCOPES,
      prompt: "consent", // force consent screen so we always get refresh_token
    });

    return NextResponse.redirect(url);
  } catch (err: unknown) {
    console.error("[auth/google] Failed to generate auth URL:", err);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
