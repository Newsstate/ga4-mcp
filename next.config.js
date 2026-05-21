/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@modelcontextprotocol/sdk",
      "@google-analytics/data",
      "googleapis",
    ],
  },
  async headers() {
    return [
      {
        source: "/api/mcp",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, mcp-session-id",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
