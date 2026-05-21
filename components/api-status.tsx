"use client";

interface ApiStatusProps {
  appUrl: string;
}

const endpoints = [
  { method: "POST", path: "/api/mcp", desc: "MCP JSON-RPC endpoint" },
  { method: "GET", path: "/api/mcp", desc: "MCP server info" },
  { method: "GET", path: "/api/health", desc: "Health check" },
  { method: "GET", path: "/api/auth/google", desc: "Start OAuth flow" },
  { method: "GET", path: "/api/ga4/properties", desc: "List GA4 properties" },
  { method: "POST", path: "/api/ga4/report", desc: "Run analytics report" },
  { method: "GET", path: "/api/ga4/realtime", desc: "Realtime active users" },
];

export default function ApiStatus({ appUrl }: ApiStatusProps) {
  return (
    <div
      className="glow-card fade-up fade-up-3"
      style={{ padding: 24, marginBottom: 24 }}
    >
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 16,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        API Endpoints
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {endpoints.map((ep) => (
          <div
            key={ep.path + ep.method}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--surface-2, #181d2e)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 4,
                background:
                  ep.method === "POST"
                    ? "rgba(251,191,36,0.12)"
                    : "rgba(91,110,245,0.15)",
                color: ep.method === "POST" ? "var(--yellow)" : "var(--accent-2)",
                border: `1px solid ${
                  ep.method === "POST"
                    ? "rgba(251,191,36,0.3)"
                    : "rgba(91,110,245,0.3)"
                }`,
                minWidth: 36,
                textAlign: "center",
              }}
            >
              {ep.method}
            </span>
            <code
              style={{
                fontSize: 12,
                color: "var(--text)",
                fontFamily: "'Space Mono', monospace",
                flex: "0 0 auto",
              }}
            >
              {ep.path}
            </code>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                flex: 1,
              }}
            >
              {ep.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
