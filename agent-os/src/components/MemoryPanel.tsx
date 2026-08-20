"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Search, Trash2, Clock } from "lucide-react";

interface MemoryEntry { id: string; text: string; tags: string[]; ts: string; }

function loadMemory(): MemoryEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("agentos-memory") || "[]"); } catch { return []; }
}
function saveMemory(entries: MemoryEntry[]) {
  localStorage.setItem("agentos-memory", JSON.stringify(entries));
  fetch("/api/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries }) }).catch(() => {});
}

export default function MemoryPanel() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [newText, setNewText] = useState("");
  const [newTags, setNewTags] = useState("");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setEntries(loadMemory()); setMounted(true); }, []);

  function add() {
    if (!newText.trim()) return;
    const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
    const e: MemoryEntry = { id: crypto.randomUUID(), text: newText.trim(), tags, ts: new Date().toISOString() };
    const updated = [e, ...entries];
    setEntries(updated);
    saveMemory(updated);
    setNewText("");
    setNewTags("");
  }

  function remove(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveMemory(updated);
  }

  const filtered = entries.filter((e) =>
    e.text.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}>
            <Brain size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Memory</h1>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>{entries.length} entries stored locally</p>
          </div>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-dimmer)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory…"
            className="pl-9 pr-3 py-1.5 rounded-lg text-xs bg-transparent outline-none"
            style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
          />
        </div>
      </div>

      {/* Add form */}
      <div className="panel p-4 space-y-3">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Store a memory, fact, note, or context…"
          rows={3}
          className="w-full bg-transparent resize-none outline-none text-sm"
          style={{ color: "var(--fg)", caretColor: "#a78bfa", borderBottom: "1px solid var(--panel-border)", paddingBottom: "8px" }}
        />
        <div className="flex items-center gap-2">
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Tags (comma-separated)…"
            className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-transparent outline-none"
            style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
          />
          <button
            onClick={add}
            disabled={!newText.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition"
            style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}
          >
            <Plus size={14} /> Store
          </button>
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="panel p-10 text-center">
          <Brain size={28} className="mx-auto mb-3" style={{ color: "var(--fg-dimmer)" }} />
          <p className="text-sm" style={{ color: "var(--fg-dim)" }}>{search ? "No results" : "Memory is empty"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="panel p-4 group flex gap-3">
              <div className="flex-1 space-y-2 min-w-0">
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg)" }}>{e.text}</p>
                <div className="flex items-center flex-wrap gap-2">
                  {e.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                      {tag}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--fg-dimmer)" }}>
                    <Clock size={9} /> {fmtDate(e.ts)}
                  </span>
                </div>
              </div>
              <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 transition shrink-0 p-1" style={{ color: "var(--fg-dimmer)" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
