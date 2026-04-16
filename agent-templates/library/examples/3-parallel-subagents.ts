import "dotenv/config";
import { createAgent } from "../agent-core/src";

if (!process.env.FIRECRAWL_API_KEY) { console.error("\n  FIRECRAWL_API_KEY not set. Get one at https://firecrawl.dev/app/api-keys\n"); process.exit(1); }

const agent = createAgent({
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  model: { provider: "google", model: "gemini-3-flash-preview" },
  maxWorkers: 5,
  workerMaxSteps: 20,
});

const result = await agent.run({
  prompt:
    "Compare Cursor, Windsurf, and Claude Code: pricing, features, and supported languages from each site",
});

console.log(result.text);
