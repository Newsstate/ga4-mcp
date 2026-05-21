"use client";

import AuthButton from "./auth-button";
import ApiStatus from "./api-status";
import GA4Cards from "./ga4-cards";

interface DashboardProps {
  isAuthenticated: boolean;
  appUrl: string;
  authError?: string | null;
  authSuccess?: boolean;
}

export default function Dashboard({
  isAuthenticated,
  appUrl,
  authError,
  authSuccess,
}: DashboardProps) {
  const mcpUrl = `${appUrl}/api/mcp`;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* ── Hero ── */}
      <div
        className="fade-up fade-up-1"
        style={{ marginBottom: 40, textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--accent-glow)",
            border: "1px solid rgba(91,110,245,0.3)",
            marginBottom: 20,
          }}
        >
          <span
            className="pulse-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isAuthenticated ? "var(--green)" : "var(--yellow)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: "'Space Mono', monospace",
              color: isAuthenticated ? "var(--green)" : "var(--yellow)",
            }}
          >
            {isAuthenticated ? "GA4 Connected" : "Not authenticated"}
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          GA4 MCP Server
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            maxWidth: 520,
            margin: "0 auto 28px",
            lineHeight: 1.65,
          }}
        >
          Connect Claude to your Google Analytics 4 data via the Model Context
          Protocol. Ask questions, run reports, and explore analytics in natural
          language.
        </p>

        <AuthButton isAuthenticated={isAuthenticated} />
      </div>

      {/* ── Notifications ── */}
      {authSuccess && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.3)",
            color: "var(--green)",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          ✅ Successfully connected to Google Analytics!
        </div>
      )}

      {authError && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            color: "var(--red)",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          ❌ Authentication error: {authError}
        </div>
      )}

      {/* ── MCP URL box ── */}
      <div
        className="fade-up fade-up-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              MCP Server URL
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <code
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  color: "var(--accent-2)",
                  background: "rgba(91,110,245,0.08)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(91,110,245,0.2)",
                }}
              >
                {mcpUrl}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(mcpUrl)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--border-2)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) =>
                  ((e.target as HTMLButtonElement).style.color = "var(--text)")
                }
                onMouseOut={(e) =>
                  ((e.target as HTMLButtonElement).style.color =
                    "var(--text-muted)")
                }
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              Add this URL to Claude Desktop or any MCP-compatible client as a
              remote server.
            </p>
          </div>
        </div>
      </div>

      {/* ── Setup instructions ── */}
      {!isAuthenticated && (
        <div
          className="glow-card fade-up fade-up-2"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            Quick Start
          </h2>
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Click \"Connect with Google\" above and authorize access to Google Analytics.",
              "Copy the MCP Server URL shown above.",
              'In Claude Desktop, open Settings → Developer → Edit Config and add this server under "mcpServers".',
              "Ask Claude: \"list my GA4 properties\" to verify the connection.",
            ].map((step, i) => (
              <li
                key={i}
                style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}
              >
                {step}
              </li>
            ))}
          </ol>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              background: "var(--surface-2, #181d2e)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 10,
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              claude_desktop_config.json
            </p>
            <pre
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: "var(--text)",
                lineHeight: 1.7,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(
                {
                  mcpServers: {
                    ga4: {
                      type: "http",
                      url: mcpUrl,
                    },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      <ApiStatus appUrl={appUrl} />
      <GA4Cards />
    </main>
  );
}
