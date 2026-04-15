# Library Template

Extensible agent-core for scripts, services, or your own app. No server — just import and run.

## Install

```bash
firecrawl-agent init my-agent -t library
```

Or manually:

```bash
npm install
npm start
```

## Environment variables

Create a `.env` file:

```
FIRECRAWL_API_KEY=fc-...            # required
ANTHROPIC_API_KEY=...               # at least one model provider
OPENAI_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
MODEL_PROVIDER=anthropic            # default provider
MODEL_ID=claude-sonnet-4-6          # default model
```

## Usage

`index.ts` is your entry point. It creates an agent and runs a prompt:

```typescript
import { createAgent } from "./agent-core/src";

const agent = createAgent({
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  model: { provider: "anthropic", model: "claude-sonnet-4-6" },
});

const result = await agent.run({ prompt: "What are the top stories on HN?" });
console.log(result.text);
```

## Examples

```bash
npm run example:basic        # single prompt, text response
npm run example:structured   # JSON schema enforcement
npm run example:parallel     # parallel Subagents
npm run example:skills       # load a Skill
npm run example:stream       # streaming with tool call events
```

Start with `example:basic`, then try `example:stream` to see tool calls in real time.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run `index.ts` |
| `npm run dev` | Run with `--watch` for auto-reload |
| `npm run example:*` | Run any of the 5 examples |

## Customizing

`agent-core/` is a folder in your project — read it, modify it, extend it. Key files:

- `agent-core/src/agent.ts` — `createAgent()` and `FirecrawlAgent` class
- `agent-core/src/orchestrator/` — tool loop, compaction, subagents
- `agent-core/src/skills/definitions/` — drop SKILL.md folders here
