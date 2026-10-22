---
name: exa-mcp
description: >
  Exa MCP server for semantic web search, code search, company research, LinkedIn people
  search, deep research, and live web fetch. Neural search engine trained for AI agents —
  returns clean structured results agents can act on. Use for lead research, competitor
  intel, people lookup, paper search, and any query where Google-style keyword search falls
  short. Trigger on: "exa", "exa search", "semantic search", "company research", "people
  search", "linkedin search", "deep search", "exa MCP", "exa.ai".
source: https://github.com/exa-labs/exa-mcp-server
stack: TypeScript + Node.js
requires: Exa API key from dashboard.exa.ai
---

# Exa MCP Server — Neural Web Search for Agents

Semantic search engine purpose-built for AI agents. Returns clean, structured, actionable results. Unlike traditional search, Exa understands intent — finds what you mean, not just what you said.

**Live hosted MCP:** `https://mcp.exa.ai/mcp`

---

## Space Age Integration

| Space Age Use Case | Exa Tool |
|---|---|
| Lead research: "find all HVAC companies in Dallas" | `webSearch` with semantic query |
| Competitor analysis: "find companies similar to Acme" | `companyResearch` |
| Outreach: find decision maker contact info | `peopleSearch` + `linkedInSearch` |
| Record Exec: find similar artists, labels, deals | `deepSearch` |
| AI research: latest papers on agent orchestration | `deepSearch` semantic |
| Client background research | `companyResearch` |

---

## Install

### Hosted MCP (Recommended — Zero Setup)
```bash
# Claude Code
claude mcp add --transport http exa https://mcp.exa.ai/mcp

# Or in mcp.json
{
  "servers": {
    "exa": {
      "type": "http",
      "url": "https://mcp.exa.ai/mcp"
    }
  }
}
```

Authentication: OAuth at `auth.exa.ai` (Google/SSO/email) or API key at `dashboard.exa.ai`

### Local NPM
```bash
npm install -g exa-mcp-server
EXA_API_KEY=your-key exa-mcp-server
```

---

## Tools Available

| Tool | Purpose | Best For |
|---|---|---|
| `webSearch` | Semantic web search + full content | General research, news, content |
| `webSearchAdvanced` | Filtered search (date, domain, type) | Precise research queries |
| `deepSearch` | Multi-hop autonomous research | Complex questions, reports |
| `deepResearchStart` + `deepResearchCheck` | Async deep research | Background long-form research |
| `companyResearch` | Company intelligence | Lead research, competitor intel |
| `peopleSearch` | Find people across web | Decision maker lookup |
| `linkedInSearch` | LinkedIn profile search | Professional contact research |
| `exaCode` | Code search | Technical patterns, examples |
| `webFetch` | Fetch specific URL content | Direct page reading |

---

## Research Orchestrator Pattern (from Exa SKILL.md)

Exa's built-in skill defines a full research orchestration pattern:

### Query Complexity Levels

| Level | When | Approach |
|---|---|---|
| Extremely Simple | 1-2 page reads | Handle directly, no subagents |
| Moderate | Fast/low-effort search | 1 subagent, clean context |
| Advanced | Clear topic, parallel searches | Light subagent use, one round |
| Complex | Cross-entity, multi-hop, exhaustive | Full multi-pass parallel subagents |

### Date Calculation (Critical)
For any time-based query ("last week", "recent", "past 6 months"):
1. Calculate exact dates from today's actual date
2. Write out calculation explicitly before searching
3. Never eyeball dates or reuse example dates

### Subagent Dispatch Pattern
```
Orchestrator reads query → assesses complexity → dispatches subagents

Each subagent:
  - Gets specific search scope
  - Uses model: "haiku" (cost efficiency)
  - Returns compact structured output
  - Keeps raw results out of orchestrator context
```

---

## Lead Research Workflow (Space Age)

```javascript
// 1. Find leads in target market
webSearchAdvanced({
  query: "HVAC companies Dallas TX with website under construction",
  numResults: 20,
  type: "company"
})

// 2. Research each company
companyResearch({
  company: "Dallas Cooling Pros",
  numResults: 5
})

// 3. Find decision maker
peopleSearch({
  query: "owner CEO Dallas Cooling Pros HVAC Texas",
  numResults: 3
})

// 4. LinkedIn verification
linkedInSearch({
  query: "John Smith Dallas Cooling Pros HVAC owner",
  numResults: 2
})
```

---

## Search Reference Files (from Exa repo)

```
skills/search/references/
  searching.md          Query writing best practices
  extraction.md         Structured data extraction patterns
  filtering.md          Date, domain, content type filters
  source-quality.md     How to assess source quality
  synthesis.md          Combining results into reports
  patterns-code.md      Code search patterns
  patterns-companies.md Company research patterns
  patterns-news.md      News + events patterns
  patterns-papers.md    Academic paper search
  patterns-people.md    People + contact lookup
  patterns-relationships.md  Entity relationship mapping
```

---

## Advanced: Deep Research (Async)

For complex research that needs 5-10+ minutes:
```javascript
// Start async research job
const job = await deepResearchStart({
  query: "Complete competitive landscape of AI website builders for local businesses 2026",
  depth: "advanced"
})

// Check status (poll or webhook)
const result = await deepResearchCheck({ id: job.id })
// Returns comprehensive report when done
```

---

## Exa vs Firecrawl — When to Use Which

| Need | Use |
|---|---|
| Find companies/people/content by meaning | **Exa** |
| Scrape a specific known URL | **Firecrawl** |
| Crawl a full website | **Firecrawl** |
| Semantic search across the web | **Exa** |
| Extract structured data from page | **Firecrawl** |
| Research "who are the top X in Y" | **Exa** |
| Interact with page (click/form) | **Firecrawl** |
| Find recent news about a topic | **Exa** |

Use both together: Exa finds → Firecrawl extracts.

---

## Trigger This Skill When
- Researching leads, companies, or people by semantic meaning
- User says: "exa", "exa search", "find companies like", "people search", "linkedin lookup"
- Need neural search (not keyword) for complex queries
- Deep research on competitors, markets, or topics
- Finding decision makers for outreach pipeline
- Any query where traditional search returns irrelevant results
