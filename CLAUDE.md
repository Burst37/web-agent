# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Firecrawl Web Agent — the open-source foundation for Firecrawl's hosted research agent (firecrawl.dev/app/agent). It's a layered stack, each layer buildable/usable independently:

```
Firecrawl API → Firecrawl SDK → Firecrawl AI SDK → agent-core → agent-templates (next / express / library) → CLI scaffolding
```

- **`agent-core/`** — the orchestrator: Firecrawl tools (search/scrape/interact) + [Deep Agents](https://docs.langchain.com/oss/javascript/deepagents/overview) (LangChain's agent loop, planning, subagent dispatch, virtual filesystem) + Skills + structured output. This is the canonical implementation.
- **`agent-templates/{next,express,library}/`** — deployable wrappers around agent-core (chat UI, REST API, bare library). Each contains its own **copy** of `agent-core/`, not a reference — see "Keeping templates in sync" below.
- **`skills/`** (repo root) — a custom library of SKILL.md playbooks auto-discovered alongside agent-core's built-in skills (see "Skills system" below).
- **`.internal/`** — not part of the public package surface: the `firecrawl-agent` scaffolding CLI, a Python port (`agent-core-py`), generated per-language API SDKs (`experimental/agent-sdks`), and the template-sync script.

There is no root `package.json` / workspace — each of `agent-core/` and the three `agent-templates/*` dirs is installed and run independently (own `pnpm-lock.yaml`).

## Commands

All commands are run from inside the relevant package directory (`agent-core/`, `agent-templates/next/`, etc.) — there is no root-level script runner.

### `agent-core/`

```bash
npm install
npm run build          # tsup -> dist/ (also copies prompts/skills markdown assets into dist/)
npm run dev            # tsup --watch
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run test:watch     # vitest (watch mode)
npx vitest run src/agent.test.ts          # single test file
npx vitest run -t "name of test"          # single test by name
npm run example:basic  # tsx examples/1-basic.ts (also :structured, :parallel, :skills, :stream)
```

Tests are colocated with source as `*.test.ts` (e.g. `agent.test.ts`, `adapter.test.ts`, `toolkit.test.ts`, `skills/discovery.test.ts`).

### `agent-templates/express/` and `agent-templates/library/`

```bash
npm install
npm run dev            # node --import tsx/esm --watch server.ts (or index.ts for library)
npm run doctor         # preflight check for required API keys/config
npm run typecheck
```

### `agent-templates/next/`

```bash
npm install
npm run dev            # runs scripts/verify-agent-core.mjs first, then `next dev`
npm run build          # same predev-style check, then `next build`
npm run lint           # next lint
```

`scripts/verify-agent-core.mjs` (predev/prebuild hook) checks that the vendored `agent-core/` copy is present and buildable before starting.

### Internal CLI (`.internal/cli/`)

```bash
cd .internal/cli && npm install && npm run build && npm link
firecrawl-agent init my-agent -t next   # or -t express / -t library
```

### Keeping templates in sync with `agent-core/`

`agent-templates/*/agent-core/` are **copies**, not symlinks or package references. Never edit a template's `agent-core/` directly — edit the canonical `agent-core/` at repo root, then run:

```bash
node .internal/scripts/sync-agent-core.mjs              # sync into all three templates
node .internal/scripts/sync-agent-core.mjs --target agent-templates/next   # one template
node .internal/scripts/sync-agent-core.mjs --dry-run
node .internal/scripts/sync-agent-core.mjs --check       # CI drift check (rsync+diff, exits 1 on mismatch)
```

## Architecture

### Tool wiring: AI SDK shape → LangChain adapter

Tools (`search`, `scrape`, `interact`, `formatOutput`, `bashExec`, etc.) are defined once in `agent-core/src/toolkit.ts` / `firecrawl-tools.ts` / `tools.ts` using the Vercel **AI SDK** `ToolSet` shape, so the same toolkit can drop into either an AI-SDK-based runtime or LangChain. `agent-core/src/agent.ts` (`aiToolToLc`) and `adapter.ts` wrap each tool with LangChain's `tool()` for Deep Agents to consume.

Two enforcement mechanisms live in this adapter layer, not just in prompt text:
- **`formatOutput` gating** (`agent.ts`, `DATA_TOOLS` set + `resultHasData()`): a per-run `runState.dataCollected` flag must be set by a real data-gathering tool call before `formatOutput` is allowed to run — stops the "formatOutput called with stub data" failure mode at the source.
- **Sub-agent tool restriction**: sub-agents (including the overridden `general-purpose` sub-agent) only get data-gathering tools + `bashExec`. `formatOutput` and `exportSkill` are orchestrator-only, since a sub-agent calling `formatOutput` mid-run would surface a partial-data artifact to the UI.

### Skills system — two discovery roots

`discoverSkills()` (`agent-core/src/skills/discovery.ts`) scans **two** directories by default and merges results, de-duplicating by skill name (earlier directory wins on conflict):

1. `agent-core/src/skills/definitions/` — framework built-ins: `deep-research`, `pricing-tracker`, `e-commerce`, `financial-research`, `competitor-analysis`, `structured-extraction`.
2. `skills/` at the repo root — this repo's own custom skill library, resolved relative to agent-core as `../../../skills` from `agent-core/src/skills/`. If agent-core is consumed standalone (published/vendored without a sibling `skills/`), this path is simply skipped.

Each skill is a directory with a `SKILL.md` (YAML frontmatter: `name`, `description`, `category`) plus optional extra resource files and an optional `sites/` subfolder of site-specific playbooks matched to the agent by hostname (`SitePlaybook.domains`) via `buildDomainIndex()`.

When adding or editing a skill, prefer the repo-root `skills/` directory unless the change is meant to ship as part of the `@firecrawl/agent-core` package itself (which pulls in `agent-core/src/skills/definitions/**` via its `files` field in `package.json`).

### HTTP API surface

`agent-core/openapi.yaml` is the single source of truth for the HTTP API (`/v1/run`, etc.) that every template (`next`, `express`) implements. Keep template route handlers in sync with this spec when changing request/response shapes.

### Model / provider resolution

Models are addressed as `{ provider, model }` (`ModelConfig` in `agent-core/src/types.ts`), providers being `google | anthropic | openai | gateway | custom-openai`. `resolve-model.ts` / `agent.ts`'s `resolveLcModel` route through LangChain's universal `initChatModel("provider:model", ...)` rather than a per-provider switch. `createAgentFromEnv()` reads `MODEL` (as `provider:id`) or split `MODEL_PROVIDER`/`MODEL_ID`, plus one API-key env var per provider (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `AI_GATEWAY_API_KEY`, `CUSTOM_OPENAI_API_KEY`/`CUSTOM_OPENAI_BASE_URL`).

## Conventions

- ESM throughout (`"type": "module"`), Node >= 20.
- 2-space indentation, LF line endings, final newline (`.editorconfig`); `.md` files are exempt from trailing-whitespace trimming.
- `dist/**` and lockfiles are marked `linguist-generated` and are build output — don't hand-edit `dist/`, it's regenerated by `tsup` (agent-core) and excluded from templates' `agent-core/` copies by the sync script.
- Runtime-loaded markdown assets (`orchestrator/prompts/`, `worker/prompts/`, `skills/definitions/`) are read via `fs.readFile` at runtime, not bundled — `tsup.config.ts`'s `onSuccess` hook copies them into `dist/` after build, and any new such asset directory needs the same treatment.

## Knowledge graph (graphify)

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships, when built with the `graphify` CLI.

- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
