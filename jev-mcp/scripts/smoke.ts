/**
 * End-to-end check over real MCP stdio: lists tools, then calls judge.
 * With no TYPESAFE_API_KEY set this exercises the bypass path, which is the
 * behaviour that must never regress — an unavailable judgment has to come back
 * as "decide it yourself", not as an error or a negative answer.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["--import", "tsx/esm", "src/server.ts"],
  stderr: "ignore",
});

const client = new Client({ name: "jev-smoke", version: "0.1.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(`tools: ${tools.map((t) => t.name).join(", ")}`);
if (tools.length !== 1 || tools[0].name !== "judge") {
  throw new Error(`expected exactly one tool named judge, got ${JSON.stringify(tools.map((t) => t.name))}`);
}

const result = await client.callTool({
  name: "judge",
  arguments: {
    state: { ticket: "I was double charged and need a refund today" },
    questions: {
      team: {
        type: "choice",
        instructions: "Which team should handle this ticket?",
        criteria: {
          billing: "Payments, invoicing, refunds",
          technical: "Bugs, outages, integrations",
          none: "No team clearly applies",
        },
      },
      urgent: {
        type: "noul",
        instructions: "Does the customer state a time constraint?",
        criteria: { true: "Names a deadline or says now/today", false: "No time constraint stated" },
      },
    },
  },
});

const text = (result.content as Array<{ type: string; text?: string }>)[0]?.text ?? "";
const payload = JSON.parse(text);
console.log("judge returned:", JSON.stringify(payload, null, 2));

if (process.env.TYPESAFE_API_KEY) {
  if (payload.available !== true) throw new Error("key was set but judgment came back unavailable");
  for (const [id, answer] of Object.entries(payload.answers as Record<string, { certainty: number }>)) {
    if (typeof answer.certainty !== "number") throw new Error(`answer ${id} is missing certainty`);
  }
  console.log("PASS — live judgment returned typed answers with certainty on each");
} else {
  if (payload.available !== false) throw new Error("no key was set but judgment claimed to be available");
  if (payload.reason !== "no_api_key") throw new Error(`expected reason no_api_key, got ${payload.reason}`);
  if (!payload.guidance) throw new Error("bypass response must carry guidance telling the caller to decide");
  console.log("PASS — bypass path returns available:false with guidance, no throw");
}

await client.close();
