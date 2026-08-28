"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Mic, MicOff, Check, Trash2 } from "lucide-react";

interface Goal { id: string; text: string; category: string; done: boolean; }

const CATEGORIES = ["Health", "Personal", "Work", "Learning", "Side Project"];
const CAT_COLORS: Record<string, string> = {
  Health: "#4ade80", Personal: "#60a5fa", Work: "#d97757", Learning: "#a78bfa", "Side Project": "#f472b6",
};

function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("agentos-goals") || "[]"); } catch { return []; }
}
function saveGoals(goals: Goal[]) {
  localStorage.setItem("agentos-goals", JSON.stringify(goals));
  fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goals }) }).catch(() => {});
}

export default function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState("Work");
  const [listening, setListening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGoals(loadGoals());
    setMounted(true);
  }, []);

  function add() {
    if (!newText.trim()) return;
    const updated = [...goals, { id: crypto.randomUUID(), text: newText.trim(), category: newCat, done: false }];
    setGoals(updated);
    saveGoals(updated);
    setNewText("");
  }

  function toggle(id: string) {
    const updated = goals.map((g) => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    saveGoals(updated);
  }

  function remove(id: string) {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  }

  function toggleMic() {
    type SR = { new(): { lang: string; onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void; onend: () => void; start: () => void } };
    const SRClass = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as SR | undefined;
    if (!SRClass) return;
    if (listening) { setListening(false); return; }
    const rec = new SRClass();
    rec.onresult = (e) => setNewText((p) => p + e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
          <Target size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Goals</h1>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>{goals.filter((g) => g.done).length} / {goals.length} complete</p>
        </div>
      </div>

      {/* Add form */}
      <div className="panel p-4 flex items-center gap-2 flex-wrap">
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs bg-transparent outline-none shrink-0"
          style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a goal…"
          className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-transparent outline-none min-w-[160px]"
          style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
        />
        <button onClick={toggleMic} className="p-2 rounded-lg transition" style={{ color: listening ? "var(--accent)" : "var(--fg-dimmer)", background: listening ? "var(--accent-dim)" : "transparent" }}>
          {listening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition" style={{ background: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* By category */}
      {CATEGORIES.map((cat) => {
        const catGoals = goals.filter((g) => g.category === cat);
        if (catGoals.length === 0) return null;
        const done = catGoals.filter((g) => g.done).length;
        const pct = Math.round((done / catGoals.length) * 100);
        return (
          <div key={cat} className="panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>{cat}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${CAT_COLORS[cat]}22`, color: CAT_COLORS[cat] }}>{done}/{catGoals.length}</span>
              </div>
              <span className="text-xs" style={{ color: "var(--fg-dimmer)" }}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CAT_COLORS[cat] }} />
            </div>
            <div className="space-y-1.5">
              {catGoals.map((g) => (
                <div key={g.id} className="flex items-center gap-2.5 group">
                  <button
                    onClick={() => toggle(g.id)}
                    className="w-5 h-5 rounded-md shrink-0 grid place-items-center transition"
                    style={{ border: `1.5px solid ${g.done ? CAT_COLORS[cat] : "var(--panel-border-hot)"}`, background: g.done ? `${CAT_COLORS[cat]}22` : "transparent" }}
                  >
                    {g.done && <Check size={11} style={{ color: CAT_COLORS[cat] }} />}
                  </button>
                  <span className="flex-1 text-sm" style={{ color: g.done ? "var(--fg-dimmer)" : "var(--fg)", textDecoration: g.done ? "line-through" : "none" }}>
                    {g.text}
                  </span>
                  <button onClick={() => remove(g.id)} className="opacity-0 group-hover:opacity-100 transition p-1" style={{ color: "var(--fg-dimmer)" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {goals.length === 0 && (
        <div className="panel p-10 text-center">
          <Target size={28} className="mx-auto mb-3" style={{ color: "var(--fg-dimmer)" }} />
          <p className="text-sm" style={{ color: "var(--fg-dim)" }}>No goals yet — add one above</p>
        </div>
      )}
    </div>
  );
}
