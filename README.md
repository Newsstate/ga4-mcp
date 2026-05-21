# GA4 MCP Server

A **Model Context Protocol (MCP) server** built with Next.js that connects Claude (and any MCP-compatible AI client) to **Google Analytics 4** data. Deploy to Vercel in minutes.

---

## Features

- 🔐 **Google OAuth 2.0** — one-click sign-in, automatic token refresh
- 📊 **7 MCP tools** — reports, realtime data, top pages, traffic sources, events, audience
- ⚡ **Hosted on Vercel** — serverless, zero-infrastructure, auto-scaling
- 🛡️ **Read-only GA4 access** — only `analytics.readonly` scope requested

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd GA4mcp
npm install
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Analytics Data API** and **Google Analytics Admin API**
4. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback` (dev) and `https://your-app.vercel.app/api/auth/callback` (prod)
5. Copy **Client ID** and **Client Secret**

### 3. Environment Variables

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local
```

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=run_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Connect with Google**, authorize access.

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard or via CLI:

```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL        # https://your-app.vercel.app
vercel env add NEXT_PUBLIC_APP_URL # https://your-app.vercel.app
```

After deploying, update your Google OAuth redirect URI to include `https://your-app.vercel.app/api/auth/callback`.

---

## Connect to Claude

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ga4": {
      "type": "http",
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

Restart Claude Desktop. You'll now see GA4 tools available.

---

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_properties` | List all accessible GA4 properties |
| `run_report` | Custom report with any metrics/dimensions |
| `run_realtime_report` | Active users in last 30 minutes |
| `get_top_pages` | Top pages by page views |
| `get_traffic_sources` | Sessions by channel/source/medium |
| `get_audience_overview` | Users by country, device, browser |
| `get_events` | Event counts and per-user averages |

### Example Claude Prompts

```
List all my GA4 properties
```

```
Show me the top 10 pages for property 123456789 in the last 30 days
```

```
How many active users are on my site right now? Property ID: 123456789
```

```
Compare traffic sources for January vs February 2024 for property 123456789
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/mcp` | MCP JSON-RPC endpoint |
| `GET`  | `/api/mcp` | MCP server info / discovery |
| `GET`  | `/api/health` | Health check + auth status |
| `GET`  | `/api/auth/google` | Initiate Google OAuth |
| `GET`  | `/api/auth/callback` | OAuth callback handler |
| `POST` | `/api/auth/signout` | Sign out (clear tokens) |
| `GET`  | `/api/ga4/properties` | List GA4 properties (REST) |
| `POST` | `/api/ga4/report` | Run report (REST) |
| `GET`  | `/api/ga4/realtime` | Realtime report (REST) |

---

## Security Notes

- Tokens are stored in **HttpOnly cookies** — not accessible to JavaScript
- Only **read-only** GA4 scopes are requested
- For production, consider storing tokens in an encrypted database (Vercel KV, Upstash, etc.) keyed by session ID rather than cookies

---

## Project Structure

```
GA4mcp/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page (server component)
│   ├── globals.css           # Global styles
│   └── api/
│       ├── mcp/route.ts      # ← MCP server endpoint
│       ├── health/route.ts
│       ├── auth/
│       │   ├── google/       # Start OAuth
│       │   ├── callback/     # OAuth callback
│       │   └── signout/      # Sign out
│       └── ga4/
│           ├── properties/   # List properties
│           ├── realtime/     # Realtime report
│           └── report/       # Analytics report
├── components/               # React UI components
├── lib/
│   ├── auth.ts               # Cookie token management
│   ├── google.ts             # OAuth2 client factory
│   ├── ga4.ts                # GA4 Data API helpers
│   └── mcp.ts                # MCP server + tool definitions
└── vercel.json
```
