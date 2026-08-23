---
name: firecrawl-mcp
description: >
  Official Firecrawl MCP server for web scraping, search, crawling, and autonomous deep
  research. Search the web + scrape any URL into clean structured data + interact with pages
  (click, navigate) + autonomous deep research agent. Integrates with all MCP-compatible
  agents. Use for lead gen scraping, competitor research, client site analysis, and brand
  extraction. Trigger on: "firecrawl", "scrape this URL", "web scrape", "crawl this site",
  "deep research", "extract from web", "firecrawl MCP", "fc-".
source: https://github.com/firecrawl/firecrawl-mcp-server
stack: TypeScript + Node.js
requires: Firecrawl API key (fc-...) or self-hosted instance
---

# Firecrawl MCP Server — Web Intelligence for Agents

Search + scrape + crawl + research. Full web interaction layer for any MCP-compatible agent. Automatic retries, rate limiting, cloud and self-hosted support.

---

## Space Age Integration

| Space Age Use Case | Firecrawl Capability |
|---|---|
| Cinematic Website Builder Phase 0.5 | Scrape client URL → extract brand tokens |
| Lead gen competitor analysis | Deep crawl competitor sites → extract positioning |
| Lead profile enrichment | Scrape business website → extract NAP, services, reviews |
| Outreach personalization | Scrape lead's site → feed rapport profiles to Vapi |
| SEO audit | Crawl entire site → extract all meta, headings, schema |
| Price monitoring | Scrape competitor pricing pages |

---

## Install

```bash
# Option 1: npx (zero install)
env FIRECRAWL_API_KEY=fc-YOUR_KEY npx -y firecrawl-mcp

# Option 2: Global install
npm install -g firecrawl-mcp

# Option 3: Docker
docker build -t firecrawl-mcp .
docker run -e FIRECRAWL_API_KEY=fc-YOUR_KEY firecrawl-mcp
```

Get API key: [firecrawl.dev](https://firecrawl.dev)

---

## MCP Server Config

### Claude Code
```bash
claude mcp add --transport stdio firecrawl -- npx -y firecrawl-mcp
# Set env: FIRECRAWL_API_KEY=fc-...
```

### Hermes Agent (VPS)
```json
{
  "mcp_servers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-YOUR_KEY"
      }
    }
  }
}
```

### Cursor
```json
{
  "mcpServers": {
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "fc-YOUR_KEY" }
    }
  }
}
```

---

## Tools Available

| Tool | What It Does |
|---|---|
| `scrape` | Scrape any URL → clean markdown/structured data |
| `search` | Web search + return full page content |
| `crawl` | Crawl entire site recursively |
| `interact` | Click buttons, fill forms, navigate pages |
| `deep_research` | Autonomous research agent — multi-hop web research |
| `cloud_browser` | Full browser session with agent automation |

---

## Key Use Cases

### 1. Brand Extraction (Phase 0.5 of Cinematic Website Builder)
```javascript
// Auto-triggers when any client URL is provided
scrape({
  url: "https://clientwebsite.com",
  formats: ["markdown", "extract"],
  extract: {
    schema: {
      colors: "array",
      fonts: "array",
      tagline: "string",
      services: "array",
      tone: "string"
    }
  }
})
```

### 2. Lead Enrichment
```javascript
// After Google Maps scrape, enrich each lead
scrape({
  url: lead.website,
  formats: ["extract"],
  extract: {
    schema: {
      owner_name: "string",
      services: "array",
      pricing: "string",
      years_in_business: "number",
      reviews_summary: "string"
    }
  }
})
```

### 3. Deep Competitor Research
```javascript
deep_research({
  query: "top HVAC companies Dallas TX pricing and services",
  maxDepth: 3,
  maxPages: 20
})
```

### 4. Crawl Client Site for SEO Audit
```javascript
crawl({
  url: "https://clientsite.com",
  limit: 100,
  scrapeOptions: {
    formats: ["markdown"],
    onlyMainContent: true
  }
})
```

---

## Self-Hosted Option

For high-volume lead gen scraping (avoid API rate limits):
```bash
# Deploy Firecrawl on VPS alongside Hermes
git clone https://github.com/firecrawl/firecrawl.git
cd firecrawl
docker-compose up -d

# Point MCP server to local instance
FIRECRAWL_API_URL=http://localhost:3002 npx firecrawl-mcp
```

---

## Rate Limits + Retry Logic

Firecrawl MCP handles:
- Automatic retries on 429/503
- Exponential backoff
- Queue management for bulk scraping
- Cloud + self-hosted failover

---

## Integration with Existing SA Firecrawl CLI Skill

Your existing `firecrawl-cli` skill at `/mnt/skills/user/firecrawl-cli/` handles the programmatic extraction workflows. This MCP server is the **agent-native** complement — use it when Hermes or Claude Code needs to trigger web research as part of a larger task.

---

## Trigger This Skill When
- Scraping any URL for brand extraction, lead enrichment, or research
- User says: "firecrawl", "scrape this", "crawl this site", "deep research", "fc-"
- Cinematic Website Builder Phase 0.5 (client URL analysis)
- Setting up Firecrawl MCP on Hermes Agent or Claude Code
- Any web data extraction task in the pipeline
