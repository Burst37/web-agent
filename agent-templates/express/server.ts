import "dotenv/config";
import express from "express";
import { createFirecrawlAgentFromEnv, toSSE } from "./agent-core/src";

const app = express();
app.use(express.json());

app.post("/v1/run", async (req, res) => {
  const { prompt, stream, model, ...rest } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const agent = await createFirecrawlAgentFromEnv(model ? { model } : undefined);
    const input = { messages: [{ role: "user" as const, content: prompt }] };

    if (stream) {
      await toSSE(agent, input, res);
    } else {
      const result = await agent.invoke(input, rest);
      const last = result.messages[result.messages.length - 1];
      res.json({
        text: typeof last.content === "string" ? last.content : JSON.stringify(last.content),
        messages: result.messages,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!res.headersSent) res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  const model = process.env.MODEL ?? "anthropic:claude-sonnet-4-6";
  const keys = ["FIRECRAWL_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY"]
    .filter((k) => process.env[k])
    .map((k) => k.replace(/_API_KEY/, "").toLowerCase());
  console.log(`\n  firecrawl-agent  http://localhost:${port}  ${model}  keys: ${keys.join(", ")}\n`);
});
