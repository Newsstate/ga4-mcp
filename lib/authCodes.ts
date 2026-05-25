// In-memory store for short-lived auth codes
// For production, replace with Vercel KV or Upstash Redis
const authCodeStore = new Map<string, string>();

export function storeAuthCode(code: string, accessToken: string) {
  authCodeStore.set(code, accessToken);
  setTimeout(() => authCodeStore.delete(code), 5 * 60 * 1000);
}

export function consumeAuthCode(code: string): string | undefined {
  const token = authCodeStore.get(code);
  if (token) authCodeStore.delete(code);
  return token;
}
