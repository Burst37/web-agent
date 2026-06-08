import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Mirrors agentic-os.config.example.json: ~/.agentic-os/config.json (or
// agentic-os.config.json in the project root) overrides auto-detected paths.
function loadConfig(): Record<string, unknown> {
  const candidates = [
    path.join(os.homedir(), ".agentic-os", "config.json"),
    path.join(process.cwd(), "agentic-os.config.json"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      return JSON.parse(readFileSync(file, "utf8"));
    } catch {
      // ignore malformed config, fall through to defaults
    }
  }
  return {};
}

let vaultRootCache: string | null | undefined;

export function getVaultRoot(): string | null {
  if (vaultRootCache !== undefined) return vaultRootCache;
  const cfg = loadConfig();
  const configured = typeof cfg.vaultRoot === "string" ? cfg.vaultRoot : null;
  const candidates = [
    configured,
    path.join(os.homedir(), "Documents", "Obsidian Vault"),
    path.join(os.homedir(), "Obsidian Vault"),
    path.join(os.homedir(), "Obsidian"),
  ].filter((p): p is string => !!p);

  vaultRootCache = candidates.find((p) => existsSync(p)) ?? null;
  return vaultRootCache;
}

export function getAgenticOsFolder(): string | null {
  const root = getVaultRoot();
  return root ? path.join(root, "Agentic OS") : null;
}
