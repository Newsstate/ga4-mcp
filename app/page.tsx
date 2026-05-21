import { headers } from "next/headers";
import Navbar from "@/components/navbar";
import Dashboard from "@/components/dashboard";
import { getTokenCookie } from "@/lib/auth";

interface SearchParams {
  auth?: string;
  error?: string;
}

export default function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tokens = getTokenCookie();
  const isAuthenticated = !!tokens;

  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const appUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${protocol}://${host}`;

  return (
    <>
      <Navbar />
      <Dashboard
        isAuthenticated={isAuthenticated}
        appUrl={appUrl}
        authError={searchParams.error ?? null}
        authSuccess={searchParams.auth === "success"}
      />
    </>
  );
}
