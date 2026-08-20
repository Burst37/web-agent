"use client";

import { useState } from "react";
import { Layers, Terminal, Send, FolderOpen } from "lucide-react";

const SAMPLE_TASKS = [
  { id: "1", label: "Fix TypeScript errors in pipeline", status: "pending" },
  { id: "2", label: "Write unit tests for Goals API", status: "done" },
  { id: "3", label: "Refactor Shell sidebar", status: "in-progress" },
  { id: "4", label: "Add voice input to journal", status: "pending" },
];

export default function ClaudeWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks] = useState(SAMPLE_TASKS);

  async function runPrompt() {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const r = await fetch("/api/claude/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      setOutput(j.output || j.content || JSON.stringify(j));
    } catch {
      setOutput("Claude Code CLI not connected.\n\nTo use workspace features, install claude-code and configure the /api/claude/workspace endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-4" style={{ height: "calc(100vh - 200px)" }}>
      {/* Left: task list */}
      <div className="panel flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <FolderOpen size={14} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Tasks</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition hover:bg-white/5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${t.status === "done" ? "bg-green-400" : t.status === "in-progress" ? "bg-amber-400" : "bg-white/20"}`} />
              <span className="text-xs leading-relaxed" style={{ color: t.status === "done" ? "var(--fg-dimmer)" : "var(--fg)", textDecoration: t.status === "done" ? "line-through" : "none" }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t text-[10px] text-center" style={{ borderColor: "var(--panel-border)", color: "var(--fg-dimmer)" }}>
          Connect Claude Code CLI to sync tasks
        </div>
      </div>

      {/* Right: editor/prompt */}
      <div className="panel flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <Layers size={14} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Claude Workspace</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            claude-code
          </span>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-4">
          {output ? (
            <div className="terminal" style={{ minHeight: "100%", height: "auto" }}>
              <pre className="whitespace-pre-wrap text-xs">{output}</pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
              <Terminal size={36} style={{ color: "var(--fg-dimmer)" }} />
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>Claude Code Workspace</p>
                <p className="text-xs mt-1" style={{ color: "var(--fg-dim)" }}>Type a prompt below to run Claude Code CLI</p>
              </div>
            </div>
          )}
        </div>

        {/* Prompt input */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--panel-border)" }}>
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runPrompt(); }}
              placeholder="Prompt Claude Code… (⌘+Enter to run)"
              rows={3}
              className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none"
              style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)", caretColor: "var(--accent)" }}
            />
            <button
              onClick={runPrompt}
              disabled={!prompt.trim() || loading}
              className="px-4 rounded-xl text-sm font-medium transition"
              style={{ background: prompt.trim() ? "var(--accent)" : "var(--bg-mid)", color: prompt.trim() ? "#fff" : "var(--fg-dimmer)", border: "1px solid var(--panel-border)" }}
            >
              {loading ? <span className="animate-spin">⟳</span> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
