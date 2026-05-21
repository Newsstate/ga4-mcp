import { cookies } from "next/headers";

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

const COOKIE_NAME = "ga4_tokens";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Persist OAuth tokens in an HttpOnly cookie.
 * In production you should encrypt / store server-side (KV, DB, etc.).
 */
export function setTokenCookie(tokens: TokenData): void {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function getTokenCookie(): TokenData | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenData;
  } catch {
    return null;
  }
}

export function clearTokenCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function isTokenExpired(tokens: TokenData): boolean {
  if (!tokens.expiry_date) return false;
  // Consider expired if < 60 s left
  return Date.now() >= tokens.expiry_date - 60_000;
}
