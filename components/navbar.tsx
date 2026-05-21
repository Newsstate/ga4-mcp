"use client";

export default function Navbar() {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,14,24,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            📊
          </div>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            GA4 MCP
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            /health
          </a>
          <a
            href="/api/mcp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            /api/mcp
          </a>
        </div>
      </div>
    </nav>
  );
}
