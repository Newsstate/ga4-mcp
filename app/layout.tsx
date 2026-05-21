import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GA4 MCP Server",
  description:
    "Google Analytics 4 Model Context Protocol server — connect Claude to your GA4 data.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
