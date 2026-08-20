"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, X, CheckCircle, XCircle, ChevronRight } from "lucide-react";

interface PipelineItem {
  id: string;
  title: string;
  route: string;
  classification: string;
  stage: string;
  createdAt?: string;
}

const STAGES = [
  { key: "inbox",    label: "Inbox",    color: "#60a5fa" },
  { key: "review",   label: "Review",   color: "#facc15" },
  { key: "building", label: "Building", color: "#d97757" },
  { key: "shipped",  label: "Shipped",  color: "#4ade80" },
  { key: "rejected", label: "Rejected", color: "#f87171" },
];

const ROUTE_COLORS: Record<string, string> = {
  action: "#d97757", idea: "#60a5fa", reference: "#a78bfa", project: "#4ade80",
};

export default function PipelineView() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRoute, setNewRoute] = useState("idea");
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((j) => setItems(j.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function captureIdea() {
    if (!newTitle.trim() || capturing) return;
    setCapturing(true);
    try {
      const r = await fetch("/api/pipeline/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), route: newRoute }),
      });
      if (r.ok) {
        const j = await r.json();
        setItems((prev) => [j.item || { id: crypto.randomUUID(), title: newTitle, route: newRoute, classification: "", stage: "inbox" }, ...prev]);
      } else throw new Error();
    } catch {
      setItems((prev) => [{ id: crypto.randomUUID(), title: newTitle, route: newRoute, classification: "pending triage", stage: "inbox", createdAt: new Date().toISOString() }, ...prev]);
    } finally {
      setCapturing(false);
      setShowModal(false);
      setNewTitle("");
    }
  }

  async function shape(id: string) {
    try {
      await fetch("/api/pipeline/shape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch { /* graceful */ }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stage: "review" } : i));
  }

  async function decide(id: string, approved: boolean) {
    try {
      await fetch("/api/pipeline/decide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
    } catch { /* graceful */ }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stage: approved ? "building" : "rejected" } : i));
  }

  const byStage = (key: string) => items.filter((i) => i.stage === key);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            <Zap size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Pipeline</h1>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Idea triage & project pipeline</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={14} /> Capture Idea
        </button>
      </div>

      {/* Columns */}
      {loading ? (
        <div className="text-sm animate-pulse text-center py-8" style={{ color: "var(--fg-dim)" }}>Loading pipeline…</div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {STAGES.map((stage) => {
            const cols = byStage(stage.key);
            return (
              <div key={stage.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-dim)" }}>{stage.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-dimmer)" }}>{cols.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {cols.map((item) => (
                    <div key={item.id} className="panel p-3 space-y-2">
                      <div className="text-xs font-medium leading-snug" style={{ color: "var(--fg)" }}>{item.title}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                          style={{ background: `${ROUTE_COLORS[item.route] || "#6b7280"}22`, color: ROUTE_COLORS[item.route] || "#6b7280" }}
                        >
                          {item.route}
                        </span>
                        {item.classification && <span className="text-[9px]" style={{ color: "var(--fg-dimmer)" }}>{item.classification}</span>}
                      </div>
                      {stage.key === "inbox" && (
                        <button onClick={() => shape(item.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md w-full justify-center transition" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(217,119,87,0.2)" }}>
                          <ChevronRight size={10} /> Shape
                        </button>
                      )}
                      {stage.key === "review" && (
                        <div className="flex gap-1">
                          <button onClick={() => decide(item.id, true)} className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded-md transition" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>
                            <CheckCircle size={10} /> Yes
                          </button>
                          <button onClick={() => decide(item.id, false)} className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded-md transition" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                            <XCircle size={10} /> No
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {cols.length === 0 && (
                    <div className="text-[10px] text-center py-4 rounded-xl" style={{ color: "var(--fg-dimmer)", border: "1px dashed var(--panel-border)" }}>empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Capture modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="panel p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Capture Idea</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--fg-dimmer)" }}><X size={16} /></button>
            </div>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && captureIdea()}
              placeholder="What's the idea?"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)" }}
            />
            <div>
              <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Route</label>
              <div className="flex gap-2 flex-wrap">
                {["action", "idea", "reference", "project"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewRoute(r)}
                    className="px-2.5 py-1 rounded-lg text-xs transition"
                    style={{ background: newRoute === r ? `${ROUTE_COLORS[r]}22` : "transparent", border: `1px solid ${newRoute === r ? ROUTE_COLORS[r] : "var(--panel-border)"}`, color: newRoute === r ? ROUTE_COLORS[r] : "var(--fg-dim)" }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={captureIdea}
              disabled={!newTitle.trim() || capturing}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent)", color: "#fff", opacity: !newTitle.trim() ? 0.5 : 1 }}
            >
              {capturing ? "Capturing…" : "Capture →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
