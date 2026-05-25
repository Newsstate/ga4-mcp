// ─── Auth Code Store ──────────────────────────────────────────────────────────
//
// Stores short-lived auth codes (5 min TTL) that map a temp hex code → access token.
// Used in the Claude OAuth flow: /api/auth/callback stores the code,
// /app/token/route.ts consumes it.
//
// ⚠️  IMPORTANT FOR VERCEL / SERVERLESS:
// The in-memory Map below works fine in local dev but will FAIL on Vercel
// because each serverless function invocation may run in a different process,
// wiping the Map between the /callback and /token calls.
//
// FOR PRODUCTION: Uncomment the Vercel KV block below and remove the Map block.
// Install with: npm install @vercel/kv
// Then add KV_URL and KV_REST_API_TOKEN env vars from your Vercel dashboard.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Option A: In-memory (local dev only) ─────────────────────────────────────

const authCodeStore = new Map<string, string>();

export function storeAuthCode(code: string, accessToken: string): void {
  authCodeStore.set(code, accessToken);
  // Auto-delete after 5 minutes
  setTimeout(() => authCodeStore.delete(code), 5 * 60 * 1000);
}

export function consumeAuthCode(code: string): string | undefined {
  const token = authCodeStore.get(code);
  if (token) authCodeStore.delete(code); // one-time use
  return token;
}

// ── Option B: Vercel KV (production — uncomment when deploying) ───────────────
//
// import { kv } from "@vercel/kv";
//
// export async function storeAuthCode(code: string, accessToken: string): Promise<void> {
//   await kv.set(`auth_code:${code}`, accessToken, { ex: 300 }); // 5 min TTL
// }
//
// export async function consumeAuthCode(code: string): Promise<string | undefined> {
//   const token = await kv.get<string>(`auth_code:${code}`);
//   if (token) await kv.del(`auth_code:${code}`); // one-time use
//   return token ?? undefined;
// }
