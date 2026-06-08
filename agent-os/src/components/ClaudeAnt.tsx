"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight, Wifi, WifiOff } from "lucide-react";

export default function ClaudeAnt() {
  const [lines, setLines] = useState<string[]>(["Ant CLI ready. Type a command below."]);
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ant", { method: "GET" })
      .then((r) => { setConnected(r.ok); })
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  async function run() {
    if (!cmd.trim() || loading) return;
    const c = cmd.trim();
    setLines((l) => [...l, `$ ${c}`]);
    setCmd("");
    setLoading(true);
    try {
      const r = await fetch("/api/ant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: c }),
      });
      if (!r.ok) throw new Error("not configured");
      const text = await r.text();
      setLines((l) => [...l, text]);
    } catch {
      setLines((l) => [...l, "Error: /api/ant endpoint not configured."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            <Terminal size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Ant CLI</h2>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Claude Ant agent terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: connected === true ? "#4ade80" : connected === false ? "#f87171" : "var(--fg-dimmer)" }}>
          {connected === true ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected === null ? "Checking…" : connected ? "Connected" : "Not connected"}
        </div>
      </div>

      {/* Terminal */}
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--panel-border)", background: "rgba(0,0,0,0.3)" }}>
          <div className="flex gap-1.5">
            {["#f87171", "#facc15", "#4ade80"].map((c) => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
          </div>
          <span className="text-[10px] ml-2" style={{ color: "var(--fg-dimmer)", fontFamily: "JetBrains Mono, monospace" }}>ant@claude</span>
        </div>
        <div
          className="p-4 overflow-y-auto space-y-0.5"
          style={{ height: "360px", background: "rgba(0,0,0,0.5)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#8cba80", lineHeight: 1.7 }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("$") ? "var(--accent)" : line.startsWith("Error") ? "#f87171" : "#8cba80" }}>
              {line}
            </div>
          ))}
          {loading && <div className="animate-pulse" style={{ color: "var(--accent)" }}>▶ running…</div>}
          <div ref={endRef} />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t" style={{ borderColor: "var(--panel-border)", background: "rgba(0,0,0,0.3)" }}>
          <ChevronRight size={13} style={{ color: "var(--accent)" }} className="shrink-0" />
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="ant command…"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--fg)", caretColor: "var(--accent)" }}
          />
          <button onClick={run} className="text-[10px] px-2 py-1 rounded" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>exec</button>
        </div>
      </div>
    </div>
  );
}
