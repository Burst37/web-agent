"use client";

import { useState, useEffect, useRef } from "react";
import { Cpu, ChevronRight, Activity } from "lucide-react";

export default function RufloView() {
  const [lines, setLines] = useState<string[]>(["Ruflo agent ready."]);
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"unknown" | "ok" | "error">("unknown");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ruflo")
      .then((r) => { setStatus(r.ok ? "ok" : "error"); })
      .catch(() => setStatus("error"));
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
      const r = await fetch("/api/ruflo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: c }),
      });
      if (!r.ok) throw new Error("not configured");
      const text = await r.text();
      setLines((l) => [...l, text]);
      setStatus("ok");
    } catch {
      setLines((l) => [...l, "Error: /api/ruflo not configured."]);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = status === "ok" ? "#4ade80" : status === "error" ? "#f87171" : "var(--fg-dimmer)";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(250,204,21,0.12)", color: "#facc15" }}>
            <Cpu size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Ruflo</h1>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Ruflo automation agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: statusColor }}>
          <Activity size={13} />
          {status === "unknown" ? "Checking…" : status === "ok" ? "Online" : "Offline"}
        </div>
      </div>

      {/* Terminal */}
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--panel-border)", background: "rgba(0,0,0,0.3)" }}>
          <div className="flex gap-1.5">
            {["#f87171", "#facc15", "#4ade80"].map((c) => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
          </div>
          <span className="text-[10px] ml-2" style={{ color: "var(--fg-dimmer)", fontFamily: "JetBrains Mono, monospace" }}>ruflo@agent</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: status === "ok" ? `0 0 6px ${statusColor}` : "none" }} />
        </div>

        <div
          className="p-4 overflow-y-auto"
          style={{ height: "360px", background: "rgba(0,0,0,0.5)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", lineHeight: 1.7 }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("$") ? "#facc15" : line.startsWith("Error") ? "#f87171" : "#8cba80" }}>
              {line}
            </div>
          ))}
          {loading && <div className="animate-pulse" style={{ color: "#facc15" }}>▶ running…</div>}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 border-t" style={{ borderColor: "var(--panel-border)", background: "rgba(0,0,0,0.3)" }}>
          <ChevronRight size={13} style={{ color: "#facc15" }} className="shrink-0" />
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="ruflo command…"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--fg)", caretColor: "#facc15" }}
          />
          <button onClick={run} className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(250,204,21,0.1)", color: "#facc15", border: "1px solid rgba(250,204,21,0.2)" }}>exec</button>
        </div>
      </div>
    </div>
  );
}
