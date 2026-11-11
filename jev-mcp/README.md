# jev-mcp

An MCP server exposing TypeSafe System One judgments as a single `judge` tool.

Read `skills/jev-routing/SKILL.md` in `Burst37/Space-Age-Skills` before wiring this into
anything. It covers what belongs on a System One model, the eleven documented failure
modes, and the escalation contract. This README only covers running the thing.

## What it is

One tool, `judge`. You give it state you have already gathered plus one or more typed
questions; it returns typed answers with a certainty on each.

| Question type | Returns |
|---|---|
| `noul` | probability the condition holds |
| `choice` | selected option + distribution |
| `score` | position on ordered levels + distribution |

`noul` answers carry no `confidence` from the API — the probability *is* the answer — so
the wrapper derives `certainty` as `|noul - 0.5| * 2`, which puts it on the same 0–1
scale as the `confidence` that `choice` and `score` report. Threshold on `certainty` and
the three types behave alike.

## Setup

```bash
cd jev-mcp
npm install --legacy-peer-deps   # npm 10.9.x crashes resolving vitest 4's peer graph
npm test                         # wrapper unit tests
npm run typecheck
```

The key is read from `TYPESAFE_API_KEY` in the environment and is never a tool
parameter. Keep it server-side; do not put it in this repo.

```bash
export TYPESAFE_API_KEY=...       # or put it in the VPS /root/.env
npm run smoke                     # end-to-end over real MCP stdio
```

`npm run smoke` works with or without the key. Without one it asserts the bypass path
behaves correctly; with one it asserts a live judgment comes back typed.

## Registering with Claude Code

```bash
claude mcp add jev -- node --import tsx/esm /absolute/path/to/jev-mcp/src/server.ts
```

Or build first and point at the compiled entry:

```bash
npm run build
claude mcp add jev -- node /absolute/path/to/jev-mcp/dist/server.js
```

The tool then appears as `mcp__jev__judge`.

## Failure behaviour — the part that matters

`judge()` **never throws and never fails closed.** Every failure returns
`{ available: false, reason, detail, guidance }`, where `reason` is one of `no_api_key`,
`timeout`, `http_error`, `network_error`, `bad_response`.

**`available: false` means escalate — it is not a negative answer.** A judgment layer
that fails closed turns a vendor blip into an outage, and TypeSafe's rate limits are
documented as adjustable without notice. The default bypass deadline is 2000ms,
overridable per call via `timeoutMs`.

Every judgment and every bypass is logged as one JSON line on **stderr**. stdout is the
MCP transport; anything non-protocol written there corrupts the stream.

## Two things this does not do

**It does not make Claude Code cheaper.** The agent has to decide to call `judge`, which
already costs a frontier round-trip. This adds a capability, not a discount. The token
savings only materialise in a harness where you own the loop and can call the wrapper
directly — `import { judge } from "jev-mcp/src/judge.js"` rather than going through MCP.

**It does not authorize anything.** The model treats its input as neutral data, so
injected instructions in scraped pages, PR comments or CI logs can steer it. Never let a
`judge` result alone gate a destructive or irreversible action; a deterministic rule or a
person decides those.

## Layout

```
src/judge.ts        the wrapper — plain async function, no MCP, no vendor SDK
src/judge.test.ts   unit tests, bypass paths included
src/server.ts       MCP server wrapping judge()
scripts/smoke.ts    end-to-end check over real MCP stdio
```

`judge.ts` has no MCP dependency on purpose. Import it directly from agent code, and
swap the vendor inside that one file if TypeSafe stops earning its slot.
