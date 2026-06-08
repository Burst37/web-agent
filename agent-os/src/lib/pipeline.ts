import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getAgenticOsFolder } from "./config";
import { run } from "./runner";

export type PipelineRoute = "action" | "idea" | "reference" | "project" | "escalate";
export type PipelineStage = "inbox" | "review" | "building" | "shipped" | "rejected";

export type PipelineItem = {
  slug: string;
  title: string;
  stage: PipelineStage;
  created: string;
  idea: string;
  route?: PipelineRoute;
  confidence?: number;
  tags?: string[];
  classification?: string;
  plan?: string;
  tasks?: string[];
  buildFile?: string;
};

export const STAGES: PipelineStage[] = ["inbox", "review", "building", "shipped", "rejected"];

const ROUTES: PipelineRoute[] = ["action", "idea", "reference", "project", "escalate"];

function pipelineDir(): string | null {
  const folder = getAgenticOsFolder();
  return folder ? path.join(folder, "Pipeline") : null;
}

export const PIPELINE_AVAILABLE = pipelineDir() !== null;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "idea"
  );
}

function itemFile(slug: string): string | null {
  const dir = pipelineDir();
  return dir ? path.join(dir, `${slug}.json`) : null;
}

export async function uniqueSlug(title: string): Promise<string> {
  const dir = pipelineDir();
  const base = slugify(title);
  if (!dir) return base;
  await mkdir(dir, { recursive: true });
  let slug = base;
  let n = 2;
  while (existsSync(path.join(dir, `${slug}.json`))) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function writeItem(item: PipelineItem): Promise<void> {
  const file = itemFile(item.slug);
  if (!file) return;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(item, null, 2), "utf8");
}

export async function readItem(slug: string): Promise<PipelineItem | null> {
  const file = itemFile(slug);
  if (!file || !existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as PipelineItem;
  } catch {
    return null;
  }
}

export async function listItems(): Promise<PipelineItem[]> {
  const dir = pipelineDir();
  if (!dir || !existsSync(dir)) return [];
  const files = await readdir(dir);
  const items: PipelineItem[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      items.push(JSON.parse(await readFile(path.join(dir, f), "utf8")) as PipelineItem);
    } catch {
      // skip corrupt entries
    }
  }
  return items.sort((a, b) => (a.created < b.created ? 1 : -1));
}

// --- Claude-backed shaping helpers --------------------------------------
// These shell out to the Claude Code CLI in print mode. Failures fall back
// to conservative heuristics so the pipeline keeps moving without an LLM.

async function askClaude(prompt: string, signal?: AbortSignal, timeoutMs = 90_000): Promise<string> {
  const res = await run("claude", ["-p", prompt], { timeoutMs });
  if (signal?.aborted) throw new Error("aborted");
  if (!res.ok || !res.stdout.trim()) throw new Error(res.stderr || "claude CLI returned nothing");
  return res.stdout.trim();
}

function extractJsonObject(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return JSON.parse(raw.slice(start, end + 1));
}

function extractJsonArray(text: string): unknown[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("no JSON array in response");
  const arr = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(arr)) throw new Error("not an array");
  return arr;
}

export async function classifyIdea(
  idea: string,
  signal?: AbortSignal
): Promise<{ route: PipelineRoute; title: string; confidence: number; tags: string[] }> {
  const prompt = [
    "Classify this captured idea into exactly one route:",
    "action (a quick single task), idea (worth parking for later),",
    "reference (information to file away), project (a multi-step undertaking worth planning),",
    "or escalate (you're not confident).",
    'Reply with ONLY a JSON object: {"route": "...", "title": "short descriptive title", "confidence": 0.0-1.0, "tags": ["..."]}',
    "",
    "Idea:",
    idea,
  ].join("\n");

  try {
    const out = await askClaude(prompt, signal);
    const parsed = extractJsonObject(out);
    const route = ROUTES.includes(parsed.route as PipelineRoute) ? (parsed.route as PipelineRoute) : "escalate";
    return {
      route,
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : idea.split("\n")[0].slice(0, 80),
      confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === "string").slice(0, 6) : [],
    };
  } catch {
    return { route: "escalate", title: idea.split("\n")[0].slice(0, 80), confidence: 0, tags: [] };
  }
}

export async function draftPlan(idea: string, title: string, tags: string[], signal?: AbortSignal): Promise<string> {
  const prompt = [
    "Draft a short markdown plan (5-10 bullet steps) for this project so a human can review it before work starts.",
    "",
    `Title: ${title}`,
    `Tags: ${tags.join(", ") || "none"}`,
    "Idea:",
    idea,
  ].join("\n");

  try {
    return await askClaude(prompt, signal);
  } catch {
    return [
      `- Review the idea: ${idea.slice(0, 200)}`,
      "- Define the first concrete step",
      "- Identify what \"done\" looks like",
    ].join("\n");
  }
}

export async function breakIntoTasks(title: string, plan: string, signal?: AbortSignal): Promise<string[]> {
  const prompt = [
    "Break this approved plan into 3-8 concrete subagent tasks.",
    "Reply with ONLY a JSON array of short task strings.",
    "",
    `Title: ${title}`,
    "Plan:",
    plan,
  ].join("\n");

  try {
    const out = await askClaude(prompt, signal);
    const arr = extractJsonArray(out);
    return arr.filter((t): t is string => typeof t === "string").slice(0, 12);
  } catch {
    return plan
      .split("\n")
      .filter((l) => /^[-*]\s+/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean)
      .slice(0, 12);
  }
}

export async function buildArtifact(item: PipelineItem, signal?: AbortSignal): Promise<string | null> {
  const dir = pipelineDir();
  if (!dir) return null;
  await mkdir(dir, { recursive: true });

  const prompt = [
    "Build a single self-contained HTML file (inline CSS/JS, no external assets)",
    "that delivers on this idea as a shareable artifact. Reply with ONLY the HTML.",
    "",
    `Title: ${item.title}`,
    "Plan:",
    item.plan ?? item.idea,
  ].join("\n");

  let html: string;
  try {
    html = await askClaude(prompt, signal, 170_000);
    const fenced = html.match(/```(?:html)?\s*([\s\S]*?)```/i);
    if (fenced) html = fenced[1];
  } catch {
    const body = (item.plan ?? item.idea).replace(/</g, "&lt;");
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${item.title}</title></head><body><h1>${item.title}</h1><pre>${body}</pre></body></html>`;
  }

  const file = `${item.slug}.html`;
  await writeFile(path.join(dir, file), html, "utf8");
  return file;
}
