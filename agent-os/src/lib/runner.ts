import { spawn } from "node:child_process";

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  code: number | null;
};

export type RunOptions = {
  timeoutMs?: number;
  cwd?: string;
};

// Spawns a CLI, collects stdout/stderr, and resolves instead of rejecting —
// callers (vitals, pipeline) need a result even when the binary is missing
// or hangs, so they can report status rather than crash the route.
export function run(cmd: string, args: string[] = [], opts: RunOptions = {}): Promise<RunResult> {
  const { timeoutMs = 10_000, cwd } = opts;
  const start = Date.now();

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    let child;
    try {
      child = spawn(cmd, args, { cwd, shell: false });
    } catch (e) {
      finish({ ok: false, stdout: "", stderr: String(e), durationMs: Date.now() - start, code: null });
      return;
    }

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({ ok: false, stdout, stderr: stderr || "timed out", durationMs: Date.now() - start, code: null });
    }, timeoutMs);

    child.stdout?.on("data", (d) => { stdout += d.toString(); });
    child.stderr?.on("data", (d) => { stderr += d.toString(); });
    child.on("error", (err) => {
      finish({ ok: false, stdout, stderr: String(err), durationMs: Date.now() - start, code: null });
    });
    child.on("close", (code) => {
      finish({ ok: code === 0, stdout, stderr, durationMs: Date.now() - start, code });
    });
  });
}
