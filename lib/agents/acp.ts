import { spawn, type ChildProcess } from "child_process";
import { Writable, Readable } from "stream";
import { execSync } from "child_process";

interface ACPAgent {
  name: string;
  bin: string;
  displayName: string;
}

const KNOWN_AGENTS: ACPAgent[] = [
  { name: "claude", bin: "claude-agent-acp", displayName: "Claude Code" },
  { name: "codex", bin: "codex-acp", displayName: "Codex" },
];

function isBinAvailable(bin: string): boolean {
  try {
    execSync(`which ${bin}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function detectACPAgents() {
  return KNOWN_AGENTS.map((a) => ({
    ...a,
    available: isBinAvailable(a.bin),
  }));
}

export interface ACPEvent {
  type: "text" | "tool_call" | "tool_update" | "plan" | "usage" | "done" | "error";
  text?: string;
  toolCall?: { id: string; title: string; status: string; rawInput?: unknown; rawOutput?: unknown };
  plan?: { content: string; status: string }[];
  usage?: { size: number; used: number; cost?: { amount: number; currency: string } };
  error?: string;
}

export async function* runACPAgent(opts: {
  bin: string;
  prompt: string;
  systemPrompt?: string;
  cwd?: string;
}): AsyncGenerator<ACPEvent> {
  const acp = await import("@agentclientprotocol/sdk");

  const agentProcess: ChildProcess = spawn(opts.bin, [], {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: opts.cwd ?? process.cwd(),
  });

  agentProcess.stderr?.resume();

  // Create event queue for async iteration
  const queue: ACPEvent[] = [];
  let resolve: (() => void) | null = null;
  let done = false;

  function push(event: ACPEvent) {
    queue.push(event);
    if (resolve) {
      resolve();
      resolve = null;
    }
  }

  // Handle spawn errors
  agentProcess.on("error", (err) => {
    push({ type: "error", error: (err as NodeJS.ErrnoException).code === "ENOENT" ? `Agent "${opts.bin}" not found` : err.message });
    done = true;
  });

  agentProcess.on("exit", () => {
    if (!done) {
      push({ type: "done" });
      done = true;
    }
  });

  try {
    const input = Writable.toWeb(agentProcess.stdin!) as WritableStream<Uint8Array>;
    const output = Readable.toWeb(agentProcess.stdout!) as ReadableStream<Uint8Array>;
    const stream = acp.ndJsonStream(input, output);

    const client = {
      async requestPermission(params: any) {
        const allow = params.options.find((o: any) => o.kind === "allow_once" || o.kind === "allow_always");
        return { outcome: { outcome: "selected", optionId: allow?.optionId ?? params.options[0].optionId } };
      },
      async sessionUpdate(params: any) {
        const update = params.update;
        switch (update.sessionUpdate) {
          case "agent_message_chunk":
            if ("content" in update && update.content.type === "text") {
              push({ type: "text", text: update.content.text });
            }
            break;
          case "tool_call":
            push({
              type: "tool_call",
              toolCall: {
                id: update.toolCallId,
                title: update.title ?? "tool",
                status: update.status ?? "pending",
                rawInput: update.rawInput,
                rawOutput: update.rawOutput,
              },
            });
            break;
          case "tool_call_update":
            push({
              type: "tool_update",
              toolCall: {
                id: update.toolCallId,
                title: update.title ?? "",
                status: update.status ?? "unknown",
                rawInput: update.rawInput,
                rawOutput: update.rawOutput,
              },
            });
            break;
          case "plan":
            push({
              type: "plan",
              plan: update.entries.map((e: { content: string; status: string }) => ({
                content: e.content,
                status: e.status,
              })),
            });
            break;
          case "usage_update":
            push({
              type: "usage",
              usage: { size: update.size, used: update.used, cost: update.cost ?? undefined },
            });
            break;
        }
      },
      async writeTextFile(params: any) {
        const fs = await import("fs");
        const path = await import("path");
        const dir = path.dirname(params.path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(params.path, params.content, "utf-8");
        return {};
      },
      async readTextFile(params: any) {
        const fs = await import("fs");
        return { content: fs.readFileSync(params.path, "utf-8") };
      },
    };

    const connection = new acp.ClientSideConnection((_agent) => client as any, stream);

    await connection.initialize({
      protocolVersion: acp.PROTOCOL_VERSION,
      clientCapabilities: {
        terminal: true,
        fs: { readTextFile: true, writeTextFile: true },
      },
    });

    const { sessionId } = await connection.newSession({
      cwd: opts.cwd ?? process.cwd(),
      mcpServers: [],
    });

    const fullPrompt = opts.systemPrompt
      ? `<system-context>\n${opts.systemPrompt}\n</system-context>\n\n${opts.prompt}`
      : opts.prompt;

    // Start prompt in background -- events will come via callbacks
    const promptDone = connection.prompt({
      sessionId,
      prompt: [{ type: "text", text: fullPrompt }],
    }).then(() => {
      push({ type: "done" });
      done = true;
    }).catch((err) => {
      push({ type: "error", error: err instanceof Error ? err.message : String(err) });
      done = true;
    });

    // Yield events as they come
    while (!done) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise<void>((r) => { resolve = r; });
      }
    }
    // Drain remaining
    while (queue.length > 0) {
      yield queue.shift()!;
    }

    await promptDone;
    agentProcess.kill();
  } catch (err) {
    yield { type: "error", error: err instanceof Error ? err.message : String(err) };
    agentProcess.kill();
  }
}
