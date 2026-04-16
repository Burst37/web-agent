/**
 * 1. Basic usage - single prompt, text response
 *
 *   npx tsx examples/1-basic.ts
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
});

const result = await agent.run({
  prompt: "What are the top 3 stories on Hacker News right now?",
});

console.log(result.text);
