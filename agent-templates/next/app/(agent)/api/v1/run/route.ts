import { createFirecrawlAgent, toResponse } from "@/agent-core";

export const maxDuration = 300;

/**
 * POST /api/v1/run — consolidated agent endpoint.
 *   Body: { prompt, stream?, model? }
 *   Stream mode returns `data: {...AgentEvent}\n\n` SSE events.
 *   Otherwise returns `{ text, messages }`.
 */
export async function POST(req: Request) {
  const { prompt, stream = false, model } = (await req.json()) as {
    prompt?: string;
    stream?: boolean;
    model?: string;
  };

  if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });

  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlApiKey) {
    return Response.json(
      { error: "FIRECRAWL_API_KEY is missing. Set it in .env.local." },
      { status: 500 },
    );
  }

  try {
    const agent = await createFirecrawlAgent({
      firecrawlApiKey,
      model: model ?? process.env.MODEL ?? "anthropic:claude-sonnet-4-6",
    });
    const input = { messages: [{ role: "user" as const, content: prompt }] };

    if (stream) return toResponse(agent, input);

    const result = await agent.invoke(input);
    const last = result.messages[result.messages.length - 1];
    return Response.json({
      text: typeof last.content === "string" ? last.content : JSON.stringify(last.content),
      messages: result.messages,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
