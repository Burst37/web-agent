"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Play, ChevronRight } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  action: string;
  hint: string;
}

interface Props {
  agent: string;
  accent: string;
  accentDim: string;
  defaultTab: string;
  tabs: Tab[];
  vitals?: React.ReactNode;
}

export default function AgentRoom({ agent, accent, accentDim, defaultTab, tabs, vitals }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [cmd, setCmd] = useState("");
  const [cmdOutput, setCmdOutput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const currentTab = tabs.find(t => t.key === activeTab) || tabs[0];

  async function runAction(tab: Tab) {
    setLoading(prev => ({ ...prev, [tab.key]: true }));
    try {
      const r = await fetch(`/api/agent-run?agent=${encodeURIComponent(agent)}&action=${encodeURIComponent(tab.action)}`);
      const text = await r.text();
      setOutputs(prev => ({ ...prev, [tab.key]: text }));
    } catch (err) {
      setOutputs(prev => ({ ...prev, [tab.key]: `Error: ${err instanceof Error ? err.message : "unknown"}` }));
    } finally {
      setLoading(prev => ({ ...prev, [tab.key]: false }));
    }
  }

  useEffect(() => {
    if (currentTab) runAction(currentTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
  }, [outputs, activeTab]);

  async function runCmd() {
    if (!cmd.trim()) return;
    setCmdOutput("Running…");
    try {
      const r = await fetch(`/api/agent-run?agent=${encodeURIComponent(agent)}&action=exec&cmd=${encodeURIComponent(cmd)}`);
      const text = await r.text();
      setCmdOutput(text);
    } catch (err) {
      setCmdOutput(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  const output = outputs[currentTab?.key || ""] || "";
  const isLoading = loading[currentTab?.key || ""];

  return (
    <div className="space-y-4">
      {vitals && <div>{vitals}</div>}

      <div className="panel overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 py-3 border-b overflow-x-auto" style={{ borderColor: "var(--panel-border)" }}>
          <Terminal size={14} className="mr-2 shrink-0" style={{ color: accent }} />
          {tabs.map(t => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                style={{
                  background: active ? accentDim : "transparent",
                  color: active ? "var(--fg)" : "var(--fg-dim)",
                  border: `1px solid ${active ? accent : "transparent"}`,
                }}
              >
                {t.label}
              </button>
            );
          })}
          <button
            onClick={() => currentTab && runAction(currentTab)}
            className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{ background: accentDim, color: accent, border: `1px solid ${accent}` }}
          >
            <Play size={11} />
            Run
          </button>
        </div>

        {/* Output */}
        <div ref={outputRef} className="terminal" style={{ height: "320px", borderRadius: 0, border: "none" }}>
          {isLoading ? (
            <span className="animate-pulse" style={{ color: accent }}>
              ▶ Fetching {currentTab?.hint || currentTab?.action}…
            </span>
          ) : output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <span style={{ color: "var(--fg-dimmer)" }}>No output yet — click Run</span>
          )}
        </div>

        {/* Command input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--panel-border)" }}>
          <ChevronRight size={13} style={{ color: accent }} className="shrink-0" />
          <input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runCmd()}
            placeholder={`${agent} command…`}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--fg)", fontFamily: "JetBrains Mono, monospace", caretColor: accent }}
          />
          <button onClick={runCmd} className="text-xs px-2 py-1 rounded" style={{ background: accentDim, color: accent }}>
            exec
          </button>
        </div>
      </div>

      {cmdOutput && (
        <div className="terminal text-xs">
          <pre className="whitespace-pre-wrap">{cmdOutput}</pre>
        </div>
      )}
    </div>
  );
}
