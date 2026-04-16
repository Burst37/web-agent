/**
 * 2. Structured output - enforce a JSON schema on the result
 *
 *   npx tsx examples/2-structured-output.ts
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
  prompt: "Get the P/E ratio and stock price for NVIDIA, Google, and Microsoft",
  format: "json",
  schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        company: { type: "string" },
        ticker: { type: "string" },
        price: { type: "number" },
        peRatio: { type: "number" },
        source: { type: "string" },
      },
    },
  },
});

console.log(result.data ?? result.text);
