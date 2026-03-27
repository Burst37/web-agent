import { createAgentUIStreamResponse } from "ai";
import { createOrchestrator } from "@/lib/agents/orchestrator";
import type { AgentConfig } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages, config } = (await req.json()) as {
    messages: unknown[];
    config: AgentConfig;
  };

  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlApiKey) {
    return new Response(
      JSON.stringify({ error: "FIRECRAWL_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const agent = await createOrchestrator(config, firecrawlApiKey);

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
