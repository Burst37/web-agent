"use client";

import { useState, useRef, useEffect } from "react";

type Event =
  | { type: "text"; content: string }
  | { type: "tool-call"; toolName: string; input: unknown }
  | { type: "tool-result"; toolName: string; output: unknown }
  | { type: "done" }
  | { type: "error"; error: string };

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [events]);

  async function submit() {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setEvents([]);
    const res = await fetch("/api/v1/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, stream: true }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() ?? "";
      for (const line of parts) {
        const data = line.replace(/^data: /, "").trim();
        if (data) setEvents((prev) => [...prev, JSON.parse(data)]);
      }
    }
    setRunning(false);
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 p-6 font-mono text-sm">
      <div ref={ref} className="flex-1 overflow-y-auto whitespace-pre-wrap">
        {events.map((e, i) => <Line key={i} e={e} />)}
        {!events.length && !running && <span className="text-zinc-600">ready.</span>}
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
        placeholder="prompt  (⌘↵ to run)"
        className="resize-none rounded border border-zinc-800 bg-zinc-900 p-2 focus:outline-none focus:border-zinc-600"
        rows={2}
        disabled={running}
      />
    </div>
  );
}

function Line({ e }: { e: Event }) {
  if (e.type === "text") return <div>{e.content}</div>;
  if (e.type === "tool-call") return <div className="text-emerald-400">→ {e.toolName}({JSON.stringify(e.input).slice(0, 100)})</div>;
  if (e.type === "tool-result") {
    const o = typeof e.output === "string" ? e.output : JSON.stringify(e.output);
    return <div className="text-zinc-500">← {e.toolName}: {o.slice(0, 160)}{o.length > 160 ? "…" : ""}</div>;
  }
  if (e.type === "error") return <div className="text-red-400">error: {e.error}</div>;
  if (e.type === "done") return <div className="text-zinc-600">done.</div>;
  return null;
}
