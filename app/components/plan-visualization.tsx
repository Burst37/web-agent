"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { cn } from "@/utils/cn";

function extractDomain(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const url = (obj.url ?? "") as string;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return null;
  }
}

function Favicon({ domain }: { domain: string }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      width={16}
      height={16}
      alt=""
      className="rounded-2 flex-shrink-0"
    />
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" className={className}>
      <path
        d="M12 19.7083C16.2572 19.7083 19.7083 16.2572 19.7083 12C19.7083 7.74276 16.2572 4.29163 12 4.29163M12 19.7083C7.74276 19.7083 4.29163 16.2572 4.29163 12C4.29163 7.74276 7.74276 4.29163 12 4.29163M12 19.7083C10.044 19.7083 8.45829 16.2572 8.45829 12C8.45829 7.74276 10.044 4.29163 12 4.29163M12 19.7083C13.956 19.7083 15.5416 16.2572 15.5416 12C15.5416 7.74276 13.956 4.29163 12 4.29163M19.5 12H4.49996"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16" className="text-black-alpha-32">
      <path
        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SkillIcon() {
  return (
    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" className="text-accent-honey">
      <path
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      className={cn(
        "text-black-alpha-32 transition-transform",
        open ? "rotate-180" : "",
      )}
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-12 py-12">
      <div className="relative w-20 h-20 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-black-alpha-8 border-t-heat-100 animate-spin" />
      </div>
    </div>
  );
}

interface ToolCallInfo {
  id: string;
  name: string;
  input: unknown;
  result?: unknown;
  status: "running" | "complete";
}

function isToolPart(part: { type: string }): boolean {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool";
}

function extractToolCalls(messages: UIMessage[]): ToolCallInfo[] {
  const calls: ToolCallInfo[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      if (!isToolPart(part)) continue;
      const p = part as Record<string, unknown>;
      const toolCallId = (p.toolCallId ?? "") as string;
      const state = (p.state ?? "") as string;
      const toolName = (p.toolName ?? (part.type as string).replace("tool-", "")) as string;
      const input = p.input ?? p.args;
      const output = p.output;

      const existing = calls.find((c) => c.id === toolCallId);
      if (existing) {
        if (state === "result") {
          existing.result = output;
          existing.status = "complete";
        }
      } else {
        calls.push({
          id: toolCallId,
          name: toolName,
          input,
          result: state === "result" ? output : undefined,
          status: state === "result" ? "complete" : "running",
        });
      }
    }
  }
  return calls;
}

function getStepDescription(call: ToolCallInfo): string {
  const obj = (call.input as Record<string, unknown>) ?? {};
  switch (call.name) {
    case "search":
      return `Searching the web for ${obj.query ?? "information"}`;
    case "scrape":
      return `Reading ${obj.url ?? "page"}`;
    case "interact":
      return `Interacting with ${obj.url ?? "page"}`;
    case "map":
      return `Mapping URLs on ${obj.url ?? "site"}`;
    case "load_skill":
      return `Loading skill: ${obj.name ?? ""}`;
    case "read_skill_resource":
      return `Reading skill resource: ${obj.file ?? ""}`;
    case "formatOutput":
      return `Formatting output as ${obj.format ?? "text"}`;
    default:
      if (call.name.startsWith("subagent_"))
        return `Delegating to sub-agent: ${obj.task ? String(obj.task).slice(0, 80) : "task"}`;
      return call.name;
  }
}

function getSearchQueries(call: ToolCallInfo): string[] {
  if (call.name !== "search") return [];
  const obj = (call.input as Record<string, unknown>) ?? {};
  return obj.query ? [String(obj.query)] : [];
}

function getScrapeUrls(call: ToolCallInfo): { url: string; domain: string }[] {
  if (call.name !== "scrape" && call.name !== "interact" && call.name !== "map") return [];
  const obj = (call.input as Record<string, unknown>) ?? {};
  if (!obj.url) return [];
  const domain = extractDomain(call.input);
  return [{ url: String(obj.url), domain: domain ?? "" }];
}

function StepRow({ call }: { call: ToolCallInfo }) {
  const [open, setOpen] = useState(false);
  const desc = getStepDescription(call);
  const queries = getSearchQueries(call);
  const urls = getScrapeUrls(call);
  const hasDetails = queries.length > 0 || urls.length > 0;
  const isSkill = call.name === "load_skill" || call.name === "read_skill_resource";
  const isSubagent = call.name.startsWith("subagent_");

  return (
    <div>
      <button
        type="button"
        className={cn(
          "w-full flex items-center gap-12 py-10 text-left transition-colors rounded-8 -mx-4 px-4",
          hasDetails && "hover:bg-black-alpha-2 cursor-pointer",
          !hasDetails && "cursor-default",
        )}
        onClick={() => hasDetails && setOpen(!open)}
      >
        {/* Icon */}
        {isSkill ? (
          <SkillIcon />
        ) : isSubagent ? (
          <div className="w-20 h-20 rounded-full bg-accent-amethyst/10 flex-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent-amethyst" />
          </div>
        ) : call.status === "running" ? (
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-black-alpha-8 border-t-heat-100 animate-spin" />
          </div>
        ) : (
          <GlobeIcon className="text-black-alpha-40 flex-shrink-0" />
        )}

        {/* Description */}
        <span className={cn(
          "flex-1 text-body-large",
          call.status === "running" ? "text-accent-black" : "text-black-alpha-64",
        )}>
          {desc}
        </span>

        {/* Chevron */}
        {hasDetails && <ChevronIcon open={open} />}
      </button>

      {/* Expanded details */}
      {open && (
        <div className="ml-32 pb-6 flex flex-col gap-4">
          {queries.map((q, i) => (
            <div key={i} className="flex items-center gap-8 py-4">
              <SearchIcon />
              <span className="text-body-medium text-black-alpha-48">{q}</span>
            </div>
          ))}
          {urls.map((u, i) => (
            <div key={i} className="flex items-center gap-8 py-4">
              {u.domain ? <Favicon domain={u.domain} /> : <GlobeIcon className="text-black-alpha-24 w-16 h-16" />}
              <span className="text-body-medium text-black-alpha-48 truncate">{u.url}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function extractLastText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      if (part.type === "text" && part.text.trim()) return part.text;
    }
  }
  return null;
}

export default function PlanVisualization({
  messages,
  isRunning,
}: {
  messages: UIMessage[];
  isRunning: boolean;
}) {
  const toolCalls = extractToolCalls(messages);
  const lastText = extractLastText(messages);
  const showText = !isRunning && lastText && toolCalls.length > 0;

  if (toolCalls.length === 0 && !isRunning) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-body-large text-black-alpha-24">
          Agent activity will appear here
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col">
        {toolCalls.map((call) => (
          <StepRow key={call.id} call={call} />
        ))}
      </div>

      {isRunning && <ThinkingIndicator />}

      {showText && (
        <div className="mt-16 pt-16 border-t border-border-faint">
          <div className="text-body-large text-accent-black whitespace-pre-wrap leading-relaxed">
            {lastText}
          </div>
        </div>
      )}
    </div>
  );
}
