"use client";

import { useState } from "react";
import { Cpu, Play, CheckCircle, Clock, Search } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "done";
  tag: string;
}

const PRESET_AGENTS: Agent[] = [
  { id: "research", name: "Research", description: "Web research and summarization agent. Gathers context and synthesizes findings.", status: "idle", tag: "research" },
  { id: "codereview", name: "Code Review", description: "Reviews diffs and PRs for bugs, security issues, and code quality.", status: "idle", tag: "dev" },
  { id: "writer", name: "Writer", description: "Drafts content, emails, docs, and long-form articles from briefs.", status: "idle", tag: "content" },
  { id: "analyst", name: "Analyst", description: "Analyzes data, identifies patterns, and produces structured reports.", status: "idle", tag: "data" },
];

const TAG_COLORS: Record<string, string> = {
  research: "#60a5fa",
  dev: "#4ade80",
  content: "#f472b6",
  data: "#facc15",
};

export default function AntAgents() {
  const [agents, setAgents] = useState<Agent[]>(PRESET_AGENTS);
  const [search, setSearch] = useState("");

  async function launch(id: string) {
    setAgents((a) => a.map((ag) => ag.id === id ? { ...ag, status: "running" } : ag));
    try {
      await fetch("/api/ant/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch { /* ignore */ }
    setTimeout(() => {
      setAgents((a) => a.map((ag) => ag.id === id ? { ...ag, status: "done" } : ag));
    }, 3000);
  }

  const filtered = agents.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Ant Agents</h2>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Specialized Claude Ant workers</p>
          </div>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-dimmer)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            className="pl-9 pr-3 py-1.5 rounded-lg text-xs bg-transparent outline-none"
            style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((ag) => (
          <div key={ag.id} className="panel p-4 space-y-3 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif", color: "var(--fg)" }}>{ag.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: `${TAG_COLORS[ag.tag]}22`, color: TAG_COLORS[ag.tag] }}>{ag.tag}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--fg-dim)" }}>{ag.description}</p>
              </div>
              <div className="ml-3 shrink-0">
                {ag.status === "idle" && <span className="w-2 h-2 rounded-full block" style={{ background: "var(--fg-dimmer)" }} />}
                {ag.status === "running" && <span className="w-2 h-2 rounded-full block animate-pulse" style={{ background: "#facc15", boxShadow: "0 0 8px #facc15" }} />}
                {ag.status === "done" && <CheckCircle size={14} style={{ color: "#4ade80" }} />}
              </div>
            </div>
            <button
              onClick={() => launch(ag.id)}
              disabled={ag.status === "running"}
              className="mt-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition self-start"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(217,119,87,0.3)", opacity: ag.status === "running" ? 0.6 : 1 }}
            >
              {ag.status === "running" ? <Clock size={12} /> : <Play size={12} />}
              {ag.status === "running" ? "Running…" : ag.status === "done" ? "Re-run" : "Launch Agent"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
