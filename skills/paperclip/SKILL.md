---
name: paperclip
description: >
  Open-source AI agent company orchestration platform. Manages multi-agent swarms
  toward business goals with org charts, budgets, and audit trails. Use when orchestrating
  the 5-agent lead gen swarm, managing parallel site builds, running Record Exec in a Box
  operations, or any task requiring cost-controlled multi-agent coordination at scale.
  Trigger on: "paperclip", "agent dashboard", "manage the swarm", "run the company",
  "orchestrate agents", "agent budgets", "clipmart".
source: https://github.com/paperclipai/paperclip
stack: Node.js + React + TypeScript
version: master
---

# Paperclip — AI Agent Company Orchestration

> "If OpenClaw is an employee, Paperclip is the company."

Open-source Node.js server + React UI that orchestrates teams of AI agents toward shared business goals. Org charts, budgets, governance, goal alignment, cost tracking — all from one dashboard, accessible from mobile.

---

## Space Age Integration Map

| Space Age Pipeline | Paperclip Role |
|---|---|
| 5-agent lead gen swarm | Top-level company goal → agents decompose and build sites |
| Record Exec in a Box | Artist operations as autonomous company |
| Hermes Agent (VPS) | Connect as adapter — Paperclip sends heartbeats |
| DeepSeek / Gemini / Codex | Hire as department agents with token budgets |
| Outreach pipeline | Assign outreach agent with per-lead spend limit |

---

## Core Workflow

```
01  Define goal    →  "Build 50 cinematic sites today, close at $500 avg"
02  Hire team      →  Claude (CEO), DeepSeek (CTO/Builder), Gemini (QA), Codex (Deploy)
03  Set budgets    →  $0.12/site Claude tokens, $0.04/site DeepSeek
04  Approve + run  →  Monitor from dashboard / phone
05  Audit          →  Every agent action logged with cost attribution
```

---

## Install

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
npm install
cp .env.example .env   # set ANTHROPIC_API_KEY, OPENAI_API_KEY etc
npm run dev
```

Dashboard: `http://localhost:3000`

Docker:
```bash
docker build -t paperclip .
docker run -p 3000:3000 --env-file .env paperclip
```

---

## Built-In Skills (`.agents/skills/`)

| Skill | Purpose |
|---|---|
| `company-creator` | Spin up full agent company from a goal spec |
| `create-agent-adapter` | Connect any agent (Hermes, Claude Code, Bash) as a worker |
| `pr-report` | Generate HTML audit reports of agent work |
| `prcheckloop` | Continuous PR review loop |
| `release-changelog` | Auto-generate changelogs from agent commits |
| `deal-with-security-advisory` | Security scanning agent task |

---

## Agent Adapters Supported

```
OpenClaw │ Claude Code │ Codex │ Cursor │ Bash │ HTTP webhooks
```

Any agent that can receive a heartbeat JSON ping is hireable.

---

## Supercharged Additions for Space Age

### 1. Per-Lead Budget Enforcement
Set `budget.max_tokens_per_task` in the company config. Each site build = one task. Agent auto-stops if budget exceeded — no runaway Claude bills.

### 2. Swarm Status Dashboard
Paperclip's React UI shows real-time status of all 25–80 simultaneous site builds. Use on mobile while builds run overnight.

### 3. Clipmart Company Templates (Coming)
Download full Space Age Lead Gen Co. as a one-click Clipmart template. Anyone pays $300 to clone your operation.

### 4. VPS Integration
```bash
# On DO VPS 146.190.78.120
pm2 start npm --name paperclip -- run start
# Telegram bot sends task webhooks → Paperclip routes to agents
```

---

## Key Files

```
server/          Node.js API
web/             React dashboard
cli/             CLI adapter for connecting external agents
.agents/skills/  Built-in agent skill library
adapter-plugin.md  How to wire any agent as a Paperclip worker
ROADMAP.md       Clipmart + mobile app timeline
```

---

## Trigger This Skill When
- Setting up or managing the 5-agent lead gen swarm
- Need cost/budget tracking across any agents
- User says: "paperclip", "manage the swarm", "agent dashboard", "run the company", "clipmart"
- Spinning up Record Exec operations as autonomous company
- Any multi-agent workflow needing audit + cost control
