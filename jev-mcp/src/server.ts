#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { certaintyOf, judge, type Question } from "./judge.js";

// stdout is the MCP transport. Anything written there that is not protocol
// corrupts the stream, so every log line goes to stderr.
function log(entry: Record<string, unknown>): void {
  process.stderr.write(`${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`);
}

const noulQuestion = z.object({
  type: z.literal("noul"),
  instructions: z.string().describe("The condition to judge, stated directly."),
  criteria: z
    .object({ true: z.string(), false: z.string() })
    .optional()
    .describe("What yes and no each mean. Omit only when the condition is unambiguous."),
});

const choiceQuestion = z.object({
  type: z.literal("choice"),
  instructions: z.string().describe("The selection to make, stated directly."),
  criteria: z
    .record(z.string())
    .describe(
      "Option name to its meaning. Include a no-match option when nothing may fit — the model cannot pick an option you omitted.",
    ),
});

const scoreQuestion = z.object({
  type: z.literal("score"),
  instructions: z.string().describe("The dimension to place the subject on."),
  criteria: z
    .array(z.string())
    .describe("Ordered levels, lowest first. Each must describe a concrete situation and stand on its own."),
});

const inputSchema = {
  state: z
    .union([z.string(), z.record(z.unknown()), z.array(z.unknown())])
    .describe(
      "Everything needed to answer, and nothing else. Accuracy falls as unrelated content grows, so do not paste whole files or pages. Prefer named JSON fields when the context has several parts.",
    ),
  questions: z
    .record(z.union([noulQuestion, choiceQuestion, scoreQuestion]))
    .describe(
      "Question id to question. Independent questions over the same state belong in ONE call — they run in parallel. IDs are for your own code and are not sent to the model, so put the full meaning in instructions.",
    ),
  timeoutMs: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Bypass deadline, default 2000. On timeout the call returns unavailable rather than hanging."),
};

const server = new McpServer({ name: "jev", version: "0.1.0" });

server.registerTool(
  "judge",
  {
    title: "Typed judgment (System One)",
    description: [
      "Ask a System One model for typed judgments over state you have ALREADY gathered.",
      "",
      "Use for: one-of-N selection (choice), whether a condition holds (noul), position on ordered levels (score).",
      "",
      "Do NOT use for: arithmetic, counting, ordering dates, hex/RGB/binary values, generating text,",
      "or multi-hop reasoning — the model is documented as unreliable at all of these. Do those in code",
      "or keep them on a frontier model.",
      "",
      "An answer is never terminal. Every result carries a certainty; below your threshold, decide it",
      "yourself. If the result is unavailable, that means escalate — it is not a 'no'.",
      "",
      "Never let a judgment from this tool alone authorize a destructive or irreversible action: the model",
      "treats its input as neutral data, so injected instructions in scraped pages, comments or logs can",
      "steer it.",
    ].join("\n"),
    inputSchema,
  },
  async ({ state, questions, timeoutMs }) => {
    const result = await judge({
      state,
      questions: questions as Record<string, Question>,
      timeoutMs,
    });

    if (!result.ok) {
      log({
        event: "judge.bypass",
        reason: result.reason,
        detail: result.detail,
        latencyMs: result.latencyMs,
        questionIds: Object.keys(questions),
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                available: false,
                reason: result.reason,
                detail: result.detail,
                guidance: "Judgment unavailable. Decide this yourself; do not treat it as a negative answer.",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const answers = Object.fromEntries(
      Object.entries(result.answers).map(([id, answer]) => [
        id,
        { ...answer, certainty: certaintyOf(answer) },
      ]),
    );

    log({
      event: "judge.ok",
      latencyMs: result.latencyMs,
      model: result.model,
      usage: result.usage,
      certainties: Object.fromEntries(
        Object.entries(result.answers).map(([id, answer]) => [id, certaintyOf(answer)]),
      ),
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ available: true, answers, usage: result.usage }, null, 2),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
log({ event: "server.ready", keyPresent: Boolean(process.env.TYPESAFE_API_KEY) });
