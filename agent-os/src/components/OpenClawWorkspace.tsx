"use client";

import { useState, useEffect } from "react";
import { Box, Circle, Plus, ArrowRight } from "lucide-react";

interface OcAgent { id: string; name: string; role: string; status: "idle" | "active" | "error"; }

const DEMO_AGENTS: OcAgent[] = [
  { id: "orch", name: "Orchestrator", role: "Coordinates all agents and manages workflow state", status: "active" },
  { id: "mem", name: "Memory", role: "Manages shared memory and context across sessions", status: "idle" },
  { id: "tool", name: "Tool Use", role: "Executes tools, APIs, and external services", status: "idle" },
  { id: "critic", name: "Critic", role: "Reviews and evaluates outputs for quality", status: "idle" },
];

const STATUS_COLOR: Record<string, string> = { idle: "var(--fg-dimmer)", active: "#4ade80", error: "#f87171" };

export default function OpenClawWorkspace() {
  const [agents, setAgents] = useState<OcAgent[]>(DEMO_AGENTS);
  const [selected, setSelected] = useState<OcAgent>(DEMO_AGENTS[0]);
  const [workflow, setWorkflow] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/openclaw/agents")
      .then((r) => r.json())
      .then((j) => { if (j.agents?.length) setAgents(j.agents); })
      .catch(() => {});
  }, []);

  async function compose() {
    if (!workflow.trim() || loading) return;
    setLoading(true);
    setOutput("");
    try {
      const r = await fetch("/api/openclaw/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      setOutput(j.output || JSON.stringify(j));
    } catch {
      setOutput("OpenClaw Workspace not configured.\n\nSet up /api/openclaw/workspace to run multi-agent workflows.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-[240px_1fr] gap-4" style={{ minHeight: "500px" }}>
      {/* Agent list */}
      <div className="panel flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Agents</span>
          <button className="p-1 rounded-md hover:bg-white/5" style={{ color: "var(--fg-dimmer)" }}>
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition"
              style={{ background: selected.id === a.id ? "rgba(244,114,182,0.1)" : "transparent" }}
            >
              <div className="mt-1">
                <Circle size={7} style={{ fill: STATUS_COLOR[a.status], color: STATUS_COLOR[a.status] }} />
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: selected.id === a.id ? "var(--fg)" : "var(--fg-dim)" }}>{a.name}</div>
                <div className="text-[10px] mt-0.5 leading-snug" style={{ color: "var(--fg-dimmer)" }}>{a.role.slice(0, 45)}…</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="panel flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6" }}>
            <Box size={14} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>{selected.name}</div>
            <div className="text-[10px]" style={{ color: "var(--fg-dimmer)" }}>{selected.role}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: STATUS_COLOR[selected.status] }}>
            <Circle size={7} style={{ fill: STATUS_COLOR[selected.status] }} />
            {selected.status}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Compose Workflow</label>
            <textarea
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value)}
              placeholder="Describe the multi-agent workflow to execute…"
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none"
              style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)", caretColor: "#f472b6" }}
            />
            <button
              onClick={compose}
              disabled={!workflow.trim() || loading}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: "#f472b6", color: "#fff", opacity: !workflow.trim() || loading ? 0.5 : 1 }}
            >
              {loading ? <span className="animate-spin">⟳</span> : <ArrowRight size={14} />}
              {loading ? "Running…" : "Execute"}
            </button>
          </div>

          {output && (
            <div className="terminal">
              <pre className="whitespace-pre-wrap text-xs">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
