---
name: cli-printing-press
description: >
  Auto-generates token-efficient Go CLIs + Claude Code skills + MCP servers from any API
  docs or undocumented website. Reads official docs, studies existing CLIs, sniffs hidden
  APIs (Google Flights, ESPN, Dominos-style). Output: compound-command CLI + matching
  Claude skill + MCP server in one shot. Trigger on: "printing press", "print a CLI",
  "generate MCP server", "api CLI", "sniff this API", "agent-native CLI", "printingpress.dev".
source: https://github.com/mvanhorn/cli-printing-press
author: mvanhorn
stack: Go 1.26.3+
requires: Go 1.26.3+, Claude Code
---

# CLI Printing Press — Auto-Generate CLIs + Skills + MCP Servers

> "Nothing is more valuable than time and money. In a world of AI agents, that's speed and token spend. A well-designed CLI is muscle memory for an agent."

Reads official API docs + studies community CLIs + sniffs undocumented APIs → prints a token-efficient Go CLI + Claude Code skill + MCP server for any API or website. One command to print. Three outputs per print job.

---

## What Gets Printed

For any target API or website, the press prints:

```
1. Go CLI binary          Token-efficient, compound commands, SQLite local cache
2. Claude Code SKILL.md   Skill file that drives the binary + teaches Claude the patterns
3. MCP server             Full MCP integration for the same API
```

All three are generated simultaneously, consistent, and agent-native.

---

## Install

```bash
# Requirements: Go 1.26.3+, Claude Code
go install github.com/mvanhorn/cli-printing-press/v4/cmd/printing-press@latest
printing-press --version    # verify

# Option A: Clone repo (recommended — git pull to update)
git clone https://github.com/mvanhorn/cli-printing-press.git
cd cli-printing-press
claude --plugin-dir .       # loads skills directly

# Option B: Install skills only (no clone)
gh skill install mvanhorn/cli-printing-press --agent claude-code --scope user
```

---

## Usage

```bash
# Start a printing session from repo root
claude --plugin-dir .

# Inside Claude Code, trigger with:
/printing-press <api-name-or-url>

# Examples:
/printing-press stripe              # Official API docs → full Stripe CLI
/printing-press espn                # Sniffs undocumented ESPN API
/printing-press google-flights      # Sniffs Google Flights internal API
/printing-press linear              # Local SQLite mirror → 50ms compound queries
```

---

## Pre-Printed CLIs Available Today

| CLI | Source | Example Query |
|---|---|---|
| `espn` | Sniffed (no official API) | "Tonight's NBA games with live score, series state, injury news" → 1 call |
| `flight-goat` | Kayak nonstop + sniffed Google Flights | "Nonstop 8hr+ SEA→? Dec 24–Jan 1, 4 people, cheapest first" |
| `linear-pp-cli` | Local SQLite mirror | "Every blocked issue whose blocker stuck >1 week" → 50ms |

Browse full catalog: [printingpress.dev](https://printingpress.dev)

---

## How the Press Works

```
1. RESEARCH   Read official API docs + study popular community CLIs
2. SNIFF      If no official API → intercept network traffic patterns
3. PLAYBOOK   Apply Peter Steinberger's power-user pattern (discrawl/gogcli style)
4. GENERATE   Output Go CLI + compound commands + agent-native flags
5. SKILL      Write SKILL.md that teaches Claude to drive the CLI
6. MCP        Generate MCP server with same tool surface
7. SCORE      Validate CLI quality + token efficiency score
```

**Key design principles:**
- Local SQLite cache for fast compound queries
- Compound commands (multiple API calls → single CLI call)
- Agent-native flags (structured output, no human-facing decoration)
- Token-efficient (no verbose descriptions, just data)

---

## Space Age Applications

### 1. Print a Google Maps CLI
The lead gen scraper already exists as Playwright. Print a CLI wrapper:
```bash
/printing-press google-maps-places-api
# → gmaps CLI with compound: search + details + reviews in one call
# → matching SKILL.md for the lead gen pipeline
# → MCP server for Hermes Agent integration
```

### 2. Print an Outreach Platform CLI
```bash
/printing-press instantly-ai        # Cold email platform
/printing-press apollo-io           # Lead enrichment
/printing-press smartlead           # Email warmup
# Each prints: CLI + skill + MCP
```

### 3. Print Shopify Admin CLI
```bash
/printing-press shopify-admin-api
# → compound commands: product + inventory + orders in one call
# → SKILL.md for TheOtherLevelOnline + WYSIWYG Eyewear
# → 50ms local SQLite mirror of product catalog
```

### 4. Auto-Generate for Any Client's API
When a new client has an existing system:
```bash
/printing-press <client-api-url>
# Prints full agent-native interface to their system in one session
```

---

## Output Quality Standards

The press applies:
- **Compound commands** — multi-step workflows as single CLI calls
- **Local SQLite** — cache API responses for offline + fast repeat queries
- **Structured output** — JSON/TSV by default, no human-readable decoration
- **Agent-native flags** — `--json`, `--tsv`, `--limit`, `--since` standard
- **Scoring** — quality + token efficiency score before shipping

---

## Key Files

```
cmd/printing-press/     Main CLI binary
skills/                 Pre-built skills for printed CLIs
.claude-plugin/         Claude Code plugin manifest
.claude/scripts/        Internal skill installation scripts
docs/CURSOR.md          Cursor-specific install + auth guide
```

---

## Trigger This Skill When
- Need a CLI or MCP server for any API (documented or not)
- User says: "printing press", "print a CLI", "generate MCP", "sniff this API"
- Building agent-native interfaces for lead gen platform tools
- Generating Shopify, analytics, or outreach CLIs for Space Age properties
- Any API interaction that needs to be token-efficient and compound-command-capable
