/**
 * 3. Parallel sub-agents - multiple companies researched concurrently
 *
 *   npx tsx examples/3-parallel-subagents.ts
 */
import { createAgent, type ModelConfig } from "../src";

if (!process.env.FIRECRAWL_API_KEY) { console.error("\n  FIRECRAWL_API_KEY not set. Get one at https://firecrawl.dev/app/api-keys\n"); process.exit(1); }

const model: ModelConfig = {
  provider: (process.env.MODEL_PROVIDER ?? "google") as ModelConfig["provider"],
  model: process.env.MODEL_ID ?? "gemini-3-flash-preview",
};

const agent = createAgent({
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  model,
  maxWorkers: 5,
  workerMaxSteps: 20,
});

const result = await agent.run({
  prompt:
    "Compare Cursor, Windsurf, and Claude Code: pricing, features, and supported languages from each site",
});

console.log(result.text);
