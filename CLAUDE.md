# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Firecrawl's open-source foundation for building autonomous web-research agents. It's a layered
stack: a canonical agent framework (`agent-core/`), deployment templates that consume it
(`agent-templates/`), and internal tooling (`.internal/`). There is no repo-root package.json —
each package (`agent-core/`, each template, `.internal/cli/`) is built, tested, and installed
independently.

```
firecrawl-aisdk (search/scrape/interact tools)  ─┐
LangChain Deep Agents (agent loop, subagents)    ─┼─▶ agent-core (Orchestrator, Skills, Workers, Output)
initChatModel (any provider)                     ─┘         │
                                                              ▼
                                        agent-templates/{next,express,library}
```

- **Harness**: [Deep Agents](https://docs.langchain.com/oss/javascript/deepagents/overview) (LangChain) — provides the plan/act loop, parallel `task` subagent spawning, and on-demand SKILL.md loading.
- **Tools**: search / scrape / interact (browser automation) / bash, from [`firecrawl-aisdk`](https://www.npmjs.com/package/firecrawl-aisdk).
- **Skills**: reusable SKILL.md playbooks, auto-discovered and loaded on demand.
- **Subagents/Workers**: parallel workers for independent subtasks, each with its own tools/skills/model.
- **Output**: `formatOutput` (structured JSON/markdown) and `bashExec` (jq/awk/sed/grep via `just-bash`).

## Package manager

**pnpm** is canonical (every package ships a `pnpm-lock.yaml`; some also carry a stray
`package-lock.json` — ignore those, they aren't the source of truth). Run all commands from
inside the relevant package directory (`agent-core/`, `agent-templates/next/`, etc.) — there's no
workspace root to run things from.

## Commands

### `agent-core/` — the framework itself

```bash
cd agent-core
pnpm test              # vitest run — full suite
pnpm test:watch        # vitest watch mode
pnpm typecheck         # tsc --noEmit
pnpm build             # tsup -> dist/
```

Run a single test file or case with vitest directly, e.g.:

```bash
pnpm vitest run src/skills/discovery.test.ts
pnpm vitest run -t "parses a stringified JSON array"
```

Tests are colocated as `*.test.ts` next to the module they cover (e.g. `adapter.ts` /
`adapter.test.ts`). There is no separate `tests/` directory in `agent-core/`.

### `agent-templates/next/` — Next.js template

```bash
cd agent-templates/next
npm run dev      # runs scripts/verify-agent-core.mjs first, then `next dev`
npm run build    # same pre-check, then `next build`
npm run lint     # next lint
```

### `agent-templates/express/` and `agent-templates/library/`

```bash
cd agent-templates/express   # or library
npm run dev         # tsx --watch
npm run start        # tsx, single run
npm run doctor       # scripts/doctor.ts — preflight-checks env vars / API key formats
npm run typecheck
npm run example:basic / example:structured / example:parallel / example:skills / example:stream
```

### `.internal/cli/`

```bash
cd .internal/cli
npm run build   # tsc
npm link        # exposes the `firecrawl-agent` command locally (init/dev/deploy)
```

### `.internal/agent-core-py/` — experimental Python port

```bash
cd .internal/agent-core-py
pip install -e ".[dev]"
pytest                  # testpaths = tests/, asyncio_mode = auto
```

There is no lint/format script configured anywhere in the repo (no ESLint/Prettier config
committed) — don't invent one.

## Architecture

### `agent-core/src/` layout

| File/dir | Purpose |
|---|---|
| `agent.ts` | `createAgent()` / `createAgentFromEnv()` public API — the ai-sdk↔LangChain tool shim and the `formatOutput` data-gating logic live here |
| `orchestrator/` | Builds the top-level Deep Agent: system prompt assembly, schema/checklist injection, subagent + worker tool wiring, context compaction |
| `worker/` | Parallel worker execution (`spawnAgents`-style subagents with their own step budget) |
| `skills/` | Skill discovery, frontmatter parsing, and the tools that expose skills to the agent |
| `toolkit.ts` | Wires `firecrawl-aisdk` into the agent-core `Toolkit` shape |
| `tools.ts` | `formatOutput`, `bashExec`, `initBashWithFiles`, `createExportSkillTool` |
| `resolve-model.ts` | Multi-provider model resolution (anthropic/openai/google/gateway/custom-openai) |
| `adapter.ts` | Converts Vercel AI SDK `tool()` shapes into LangChain tools (Deep Agents needs LangChain-shaped tools) |
| `tool-results.ts` | Normalizes tool output payloads (search/scrape/bash) into typed results |
| `types.ts` | All public TypeScript types |
| `openapi.yaml` | HTTP API spec — every template's REST surface implements this |

Tools are defined once in Vercel AI SDK `ToolSet` shape (shared between templates) and wrapped
with LangChain's `tool()` at the orchestrator boundary — that's what `adapter.ts` does. If you add
a new tool, define it in AI SDK shape and let the adapter handle the LangChain conversion; don't
hand-write a parallel LangChain tool.

### Skills

Framework skills live in `agent-core/src/skills/definitions/` — built-in, framework-owned
playbooks (deep-research, e-commerce, financial-research, competitor-analysis, pricing-tracker,
structured-extraction). Each is a `SKILL.md` (+ optional `sites/*.md` site playbooks matched by
domain). When adding a new built-in skill, put it under
`agent-core/src/skills/definitions/<name>/SKILL.md` (and list it in `agent-core/package.json`'s
`files` array so it ships in the published package).

Note: `discoverSkills()` (`agent-core/src/skills/discovery.ts`) also scans the repo-root `skills/`
directory (`REPO_SKILLS_DIR`, resolved as `../../../skills` from that file). That directory is the
repo owner's personal Claude Code skill library — unrelated to the Firecrawl agent framework's own
purpose — not a documented part of the framework's architecture. Don't treat it as a place to add
framework skills, and don't assume its contents apply to this codebase; when `agent-core` is used
standalone without that sibling directory, the scan is simply skipped.

### `agent-core` is vendored into each template, not symlinked

Each template (`agent-templates/{next,express,library}/agent-core/`) contains a **copy** of the
canonical `agent-core/` directory, kept in sync by `.internal/scripts/sync-agent-core.mjs`:

```bash
node .internal/scripts/sync-agent-core.mjs                       # sync all templates
node .internal/scripts/sync-agent-core.mjs --target agent-templates/next
node .internal/scripts/sync-agent-core.mjs --dry-run
node .internal/scripts/sync-agent-core.mjs --check                # CI drift check, no writes
```

**Never hand-edit `agent-templates/*/agent-core/`.** Fix the canonical `agent-core/` and re-run the
sync script — otherwise your fix will be silently overwritten and the templates will drift from
the framework.

### Templates

- **`agent-templates/next/`** — full chat UI. `app/(agent)/_config.ts` is the single file
  controlling model selection (orchestrator/subAgent/background), worker limits, and feature
  flags — read it first when customizing a Next.js-based agent. Routes live under
  `app/(agent)/api/*` (agent, plan, query, extract, skills, conversations, files, acp, ...).
- **`agent-templates/express/`** — REST API server (`server.ts`) implementing the same
  `openapi.yaml` surface; has request-ID propagation and a `scripts/doctor.ts` preflight check.
- **`agent-templates/library/`** — bare `agent-core` consumer for scripts/services, entry point
  `index.ts`.

All three share the same `openapi.yaml`-defined HTTP contract; when changing request/response
shapes, update `agent-core/openapi.yaml` and keep templates consistent with it.

### `.internal/` (not part of the published framework)

- `cli/` — the `firecrawl-agent` scaffolding CLI (`init`/`dev`/`deploy`), source of truth for
  template scaffolding logic; `agent-manifest.json` is its template schema.
- `agent-core-py/` — experimental Python port (pydantic-ai based), independent of the TS code.
- `experimental/agent-sdks/` — OpenAPI-generator output (one dir per language) generated from
  `agent-core/openapi.yaml` via `openapitools.json`. Treat as generated code — regenerate rather
  than hand-editing.
- `scripts/sync-agent-core.mjs` — see above.

## Conventions

- ESM throughout (`"type": "module"`); use `.ts` extensions directly via `tsx`/`node --import
  tsx/esm`, no separate compile step in dev.
- Node `>=20` required across all TS packages.
- Provider config is always `{ provider, model }` (`ModelConfig` in `types.ts`) — anthropic,
  openai, google, gateway, or custom-openai. API keys resolve from `apiKeys` option or the
  matching env var (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, etc.).
- LangChain provider packages (`@langchain/anthropic`, `@langchain/google`, `@langchain/openai`)
  are optional peer deps, imported lazily by Deep Agents based on the provider actually used —
  don't assume all of them are installed.
