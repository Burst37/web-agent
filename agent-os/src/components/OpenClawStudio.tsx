"use client";

import { useState } from "react";
import { Sparkles, Play, ChevronDown } from "lucide-react";

const AGENTS = ["orchestrator", "researcher", "writer", "coder", "analyst"];
const TEMPLATES = [
  { id: "research", label: "Deep Research", template: "Research the following topic thoroughly:\n\n{topic}\n\nProvide a structured summary with sources." },
  { id: "code", label: "Code Generation", template: "Generate production-ready code for:\n\n{description}\n\nInclude tests and documentation." },
  { id: "plan", label: "Project Planning", template: "Create a detailed project plan for:\n\n{project}\n\nBreak down into phases, tasks, and milestones." },
  { id: "custom", label: "Custom Prompt", template: "" },
];

export default function OpenClawStudio() {
  const [agent, setAgent] = useState(AGENTS[0]);
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [prompt, setPrompt] = useState(TEMPLATES[0].template);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  function selectTemplate(id: string) {
    setTemplate(id);
    const t = TEMPLATES.find((t) => t.id === id);
    if (t && t.template) setPrompt(t.template);
  }

  async function run() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput("");
    try {
      const r = await fetch("/api/openclaw/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, prompt }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      setOutput(j.output || j.content || JSON.stringify(j));
    } catch {
      setOutput("OpenClaw Studio endpoint not configured.\n\nSet up /api/openclaw/studio to enable orchestration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6" }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>OpenClaw Studio</h2>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Orchestrate multi-agent workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Left: config */}
        <div className="panel p-4 space-y-4">
          {/* Agent selector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Agent</label>
            <div className="relative">
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-transparent outline-none"
                style={{ border: "1px solid var(--panel-border)", color: "var(--fg)", background: "var(--bg-mid)" }}
              >
                {AGENTS.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--fg-dimmer)" }} />
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Template</label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t.id)}
                  className="px-2.5 py-1 rounded-lg text-xs transition"
                  style={{ background: template === t.id ? "rgba(244,114,182,0.15)" : "transparent", border: `1px solid ${template === t.id ? "#f472b6" : "var(--panel-border)"}`, color: template === t.id ? "var(--fg)" : "var(--fg-dim)" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt editor */}
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none"
              style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)", caretColor: "#f472b6", fontFamily: "Manrope, sans-serif" }}
            />
          </div>

          <button
            onClick={run}
            disabled={!prompt.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
            style={{ background: "#f472b6", color: "#fff", opacity: !prompt.trim() || loading ? 0.5 : 1 }}
          >
            {loading ? <span className="animate-spin">⟳</span> : <Play size={14} />}
            {loading ? "Running…" : "Run Agent"}
          </button>
        </div>

        {/* Right: output */}
        <div className="panel overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--panel-border)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: loading ? "#facc15" : output ? "#4ade80" : "var(--fg-dimmer)", boxShadow: loading ? "0 0 8px #facc15" : "none" }} />
            <span className="text-xs font-medium" style={{ color: "var(--fg-dim)" }}>{loading ? "Running…" : output ? "Output" : "Waiting"}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {output ? (
              <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ fontFamily: "JetBrains Mono, monospace", color: "#8cba80" }}>{output}</pre>
            ) : (
              <div className="h-full flex items-center justify-center opacity-30">
                <Sparkles size={24} style={{ color: "var(--fg-dimmer)" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
