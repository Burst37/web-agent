# Firecrawl Agent — Prompt Architecture

All system prompts and agent instructions live here for visibility and maintainability.

## Structure

```
prompts/
├── orchestrator.md      # Main agent brain — plans, delegates, synthesizes
├── worker.md            # Parallel agent instructions (spawned by orchestrator)
├── sub-agents/
│   ├── export-json.md   # JSON formatting sub-agent
│   ├── export-csv.md    # CSV/table formatting sub-agent
│   └── export-report.md # Markdown report sub-agent
└── README.md            # This file
```

## Config → Prompt Flow

1. `config.ts` defines models (orchestrator, subAgent, background)
2. `lib/agents/orchestrator.ts` builds the orchestrator prompt from sections
3. `lib/agents/workers.ts` uses worker instructions for parallel agents
4. `lib/agents/sub-agents.ts` uses sub-agent instructions for formatters
5. `.agents/skills/` contains domain-specific skill instructions (loaded on demand)

## Firecrawl Tools Available

| Tool | Default | Description |
|------|---------|-------------|
| `search` | ✅ | Web search with page scraping |
| `scrape` | ✅ | Extract content from a known URL |
| `interact` | ✅ | Browser interaction (clicks, forms, pagination) |
| `map` | ❌ | Discover all URLs on a website |
| `crawl` | ❌ | Multi-page site crawling (async) |
| `batchScrape` | ❌ | Parallel URL scraping (async) |
| `agent` | ❌ | Firecrawl's autonomous research agent (async) |

Enable in `orchestrator.ts`: `FirecrawlTools({ map: true, crawl: true, ... })`
