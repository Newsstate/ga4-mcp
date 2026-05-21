"use client";

const tools = [
  {
    name: "list_properties",
    icon: "🏠",
    desc: "List all GA4 properties accessible to the authenticated user.",
    params: "—",
  },
  {
    name: "run_report",
    icon: "📈",
    desc: "Run a full analytics report with custom metrics, dimensions, and date ranges.",
    params: "propertyId, startDate, endDate, metrics, dimensions",
  },
  {
    name: "run_realtime_report",
    icon: "⚡",
    desc: "Get real-time data for active users in the last 30 minutes.",
    params: "propertyId, metrics, dimensions",
  },
  {
    name: "get_top_pages",
    icon: "📄",
    desc: "Top pages ranked by page views with session and bounce rate data.",
    params: "propertyId, startDate, endDate, limit",
  },
  {
    name: "get_traffic_sources",
    icon: "🌐",
    desc: "Session breakdown by channel group, source, and medium.",
    params: "propertyId, startDate, endDate, limit",
  },
  {
    name: "get_audience_overview",
    icon: "👥",
    desc: "Audience demographics: country, device category, browser, or OS.",
    params: "propertyId, groupBy, startDate, endDate",
  },
  {
    name: "get_events",
    icon: "🎯",
    desc: "Event counts and per-user averages for all tracked events.",
    params: "propertyId, startDate, endDate, limit",
  },
];

export default function GA4Cards() {
  return (
    <div className="fade-up fade-up-4">
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
        Available MCP Tools
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="glow-card"
            style={{ padding: 18 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tool.icon}</span>
              <code
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  color: "var(--accent-2)",
                  fontWeight: 700,
                  lineHeight: "22px",
                }}
              >
                {tool.name}
              </code>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: 10,
              }}
            >
              {tool.desc}
            </p>
            {tool.params !== "—" && (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "rgba(91,110,245,0.07)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  {tool.params}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
