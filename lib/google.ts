import { google } from "googleapis";
import type { OAuth2Client } from "googleapis-common";
import { getTokenCookie, setTokenCookie, isTokenExpired } from "./auth";

function getRedirectUri(): string {
  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `${base}/api/auth/callback`;
}

/**
 * Creates an unauthenticated OAuth2 client (for generating the auth URL).
 */
export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
}

/**
 * Creates an authenticated OAuth2 client from the stored cookie tokens.
 * Automatically refreshes the access token when it is expired.
 * Returns null when no tokens are stored.
 */
export async function getAuthenticatedClient(): Promise<OAuth2Client | null> {
  const tokens = getTokenCookie();
  if (!tokens) return null;

  const client = createOAuthClient();
  client.setCredentials(tokens);

  // Auto-refresh when close to expiry
  if (isTokenExpired(tokens) && tokens.refresh_token) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
      setTokenCookie({
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token ?? tokens.refresh_token,
        expiry_date: credentials.expiry_date ?? undefined,
        token_type: credentials.token_type ?? undefined,
        scope: credentials.scope ?? undefined,
      });
    } catch (err) {
      console.error("[google] Token refresh failed:", err);
      return null;
    }
  }

  return client;
}

/** Scopes required for GA4 read-only access */
export const GA4_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
