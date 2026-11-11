import { mkdir, readFile, appendFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getAgenticOsFolder } from "./config";

export type JournalEntry = { time: string; text: string };

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function journalDir(): string | null {
  const folder = getAgenticOsFolder();
  return folder ? path.join(folder, "Journal") : null;
}

function journalFile(date: string): string | null {
  const dir = journalDir();
  return dir ? path.join(dir, `${date}.md`) : null;
}

const ENTRY_RE = /^### (\d{2}:\d{2}:\d{2})\n([\s\S]*?)(?=\n### |\s*$)/gm;

export async function readJournal(date: string): Promise<JournalEntry[]> {
  const file = journalFile(date);
  if (!file || !existsSync(file)) return [];
  const raw = await readFile(file, "utf8");
  const entries: JournalEntry[] = [];
  ENTRY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ENTRY_RE.exec(raw))) {
    entries.push({ time: m[1], text: m[2].trim() });
  }
  return entries;
}

export async function appendJournalEntry(date: string, text: string): Promise<{ ok: boolean }> {
  const dir = journalDir();
  const file = journalFile(date);
  if (!dir || !file) return { ok: false };
  await mkdir(dir, { recursive: true });
  const time = new Date().toISOString().slice(11, 19);
  const heading = existsSync(file) ? "" : `# Journal — ${date}\n\n`;
  await appendFile(file, `${heading}### ${time}\n${text}\n\n`, "utf8");
  return { ok: true };
}

export async function listJournalDays(limit = 30): Promise<string[]> {
  const dir = journalDir();
  if (!dir || !existsSync(dir)) return [];
  const files = await readdir(dir);
  return files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort()
    .reverse()
    .slice(0, limit);
}
