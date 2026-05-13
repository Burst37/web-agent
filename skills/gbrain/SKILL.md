---
name: gbrain
description: >
  Persistent AI agent brain with self-wiring knowledge graph, hybrid vector+graph search,
  and 34 skills. Built by Garry Tan (YC President/CEO) to power his actual agent fleet.
  17,888 pages, 4,383 people, 723 companies, 21 autonomous cron jobs — built in 12 days.
  P@5 49.1%, R@5 97.9% on 240-page corpus. Use for giving the Hermes agent persistent
  memory across sessions, building Space Age knowledge base, lead enrichment graphs.
  Trigger on: "gbrain", "agent memory", "persistent brain", "knowledge graph", "garry tan",
  "gbrain init", "agent remembers", "cross-session memory", "entity graph".
source: https://github.com/garrytan/gbrain
author: Garry Tan (YC President/CEO)
stack: TypeScript + Bun + PGLite/Postgres + pgvector
version: master (v0.32.3+)
---

# GBrain — Persistent AI Agent Brain

> "Your AI agent is smart but forgetful. GBrain gives it a brain."

Built by Garry Tan to power his actual production agent fleet. Self-wiring knowledge graph + hybrid search + 34 skills + 21 autonomous cron jobs. The brain ingests meetings, emails, tweets, voice calls, and ideas while you sleep — wakes up smarter.

**Production numbers:** 17,888 pages | 4,383 people | 723 companies | 21 cron jobs | 12 days to build  
**Benchmark:** P@5 49.1%, R@5 97.9% on 240-page corpus (+31.4pp over vector-only)

---

## Space Age Integration

| Space Age Component | GBrain Role |
|---|---|
| Hermes Agent (VPS) | Primary memory layer — persistent across all sessions |
| Lead gen pipeline | Store every scraped lead, enrich with entity graph |
| Client relationships | People + company graph auto-built from outreach |
| Voice call logs | Ingest Vapi transcripts → searchable memory |
| Record Exec roster | Artist profiles, contacts, deals — persistent graph |

---

## Install

```bash
# Quick start — local PGLite (zero-config, ready in 2s)
git clone https://github.com/garrytan/gbrain ~/gbrain && cd ~/gbrain
bun install
bun link
gbrain init              # PGLite default — asks about search mode (read cost matrix!)
gbrain import ~/notes/   # index your markdown
gbrain query "what themes show up across my notes?"
```

**⚠️ Do NOT use `bun install -g` — breaks postinstall hooks. Always `git clone + bun install + bun link`.**

For production (1000+ files, multi-machine):
```bash
# Postgres + pgvector via Supabase
gbrain init --postgres "postgresql://..."
```

---

## Search Modes (Choose at Init)

| Mode | Token Budget | Haiku 4.5 | Sonnet 4.6 | Opus 4.7 |
|---|---|---|---|---|
| `conservative` | ~4K | $40/mo | $120/mo | $200/mo |
| `balanced` | ~10K | $100/mo | $300/mo | $500/mo |
| `tokenmax` | ~20K | $200/mo | $600/mo | $1,000/mo |

Cost spreads 25x corner-to-corner. Agent confirms your choice at init — never silent default.

```bash
gbrain search modes     # current mode + per-knob attribution
gbrain search stats     # cache hit rate + intent mix after real usage
gbrain search tune      # data-driven mode recommendation
```

---

## Knowledge Graph (The Edge Over Vector-Only)

Every page write automatically:
1. Extracts entity references (people, companies, concepts)
2. Creates typed links with zero LLM calls:
   - `attended` | `works_at` | `invested_in` | `founded` | `advises`
3. Backlink-boosted ranking in retrieval

```bash
gbrain query "who works at Acme AI?"
gbrain query "what did Bob invest in this quarter?"
# Answers vector search alone can't reach
```

---

## 34 Skills Library

```bash
ls ~/gbrain/skills/
# Key skills:
#   conventions/brain-routing.md    When to switch brain/source
#   migrations/                     Schema migration helpers
#   functional-area-resolver/       25KB→13KB AGENTS.md compression
#                                   +13-17pp accuracy across all Claude models
```

### Functional Area Resolver (v0.32.3)
Compresses bloated `AGENTS.md` / `RESOLVER.md` files:
```
Input:  25KB+ AGENTS.md
Output: 13KB (48% size) with BETTER accuracy (+13-17pp)
Models: Opus 4.7, Sonnet 4.6, Haiku 4.5 all tested
Method: Two-layer dispatch — single LLM pass, no second routing call
```

---

## Cron Jobs (Autonomous)

```bash
gbrain cron list        # see active jobs
# Examples Garry runs:
# - Nightly entity enrichment (people + company graph updates)
# - Citation fixing (consolidates memory overnight)
# - Memory consolidation (deduplication + cross-reference)
# - Tweet/email ingestion from connected sources
```

---

## MCP Integration for Hermes Agent

```json
// In Hermes agent config
{
  "mcp_servers": {
    "gbrain": {
      "command": "gbrain",
      "args": ["mcp"]
    }
  }
}
```

Hermes now has persistent memory across every session.

---

## LongMemEval Benchmark

```bash
# Built-in benchmark runner (v0.28.8)
gbrain eval longmemeval <dataset.jsonl>
# - Isolated in-memory PGLite per question
# - Never touches your ~/.gbrain
# - 25.9ms p50 per question (Apple Silicon)
# - Outputs to LongMemEval evaluate_qa.py compatible JSONL
```

---

## Space Age Build Config

```bash
# On VPS 146.190.78.120
gbrain init --postgres $SUPABASE_URL
gbrain identity set "Hermes Space Age Agent"

# Ingest lead gen data
gbrain import /home/leads/scraped/     # all scraped business data
gbrain import /home/outreach/logs/     # all call/email logs

# Set up cron jobs
gbrain cron add "nightly-enrichment" "0 2 * * *" "enrich all people and companies"
gbrain cron add "memory-consolidate" "0 3 * * *" "consolidate duplicate memories"

# Connect to Hermes
pm2 start "gbrain mcp" --name gbrain-mcp
```

---

## Key Commands

```bash
gbrain init                      # Initialize brain (PGLite or Postgres)
gbrain import <path>             # Index files/directories
gbrain query "<question>"        # Hybrid graph+vector search
gbrain search "<term>"           # Keyword search
gbrain write "<slug>" "<content>" # Write a page to brain
gbrain people list               # List all people in graph
gbrain companies list            # List all companies
gbrain doctor --fix              # Auto-fix common issues
gbrain apply-migrations          # Run schema migrations
gbrain eval longmemeval <file>   # Run benchmark
```

---

## Trigger This Skill When
- Setting up persistent memory for Hermes Agent on VPS
- Building a knowledge graph of leads, clients, or artists
- User says: "gbrain", "agent memory", "persistent brain", "garry tan brain", "entity graph"
- Hermes agent needs to remember things across sessions
- Ingesting call logs, email threads, or scraped data into searchable memory
- Need to query "who knows who" or relationship graphs across pipeline contacts
