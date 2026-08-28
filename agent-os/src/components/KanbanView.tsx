"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, X } from "lucide-react";

interface Card { id: string; title: string; desc?: string; tag?: string; }
type ColKey = "todo" | "inprogress" | "review" | "done";
type Board = Record<ColKey, Card[]>;

const COLUMNS: { key: ColKey; label: string; color: string }[] = [
  { key: "todo",       label: "Todo",        color: "#6b7280" },
  { key: "inprogress", label: "In Progress",  color: "#d97757" },
  { key: "review",     label: "Review",       color: "#60a5fa" },
  { key: "done",       label: "Done",         color: "#4ade80" },
];

const TAG_COLORS = ["#d97757", "#60a5fa", "#4ade80", "#f472b6", "#a78bfa", "#facc15"];

function loadBoard(): Board {
  if (typeof window === "undefined") return { todo: [], inprogress: [], review: [], done: [] };
  try { return JSON.parse(localStorage.getItem("agentos-kanban") || "null") || { todo: [], inprogress: [], review: [], done: [] }; }
  catch { return { todo: [], inprogress: [], review: [], done: [] }; }
}
function saveBoard(b: Board) { localStorage.setItem("agentos-kanban", JSON.stringify(b)); }

export default function KanbanView() {
  const [board, setBoard] = useState<Board>({ todo: [], inprogress: [], review: [], done: [] });
  const [mounted, setMounted] = useState(false);
  const [addingTo, setAddingTo] = useState<ColKey | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState(TAG_COLORS[0]);
  const [dragCard, setDragCard] = useState<{ id: string; col: ColKey } | null>(null);

  useEffect(() => { setBoard(loadBoard()); setMounted(true); }, []);

  function update(next: Board) { setBoard(next); saveBoard(next); }

  function addCard(col: ColKey) {
    if (!newTitle.trim()) return;
    const next = { ...board, [col]: [...board[col], { id: crypto.randomUUID(), title: newTitle.trim(), tag: newTag }] };
    update(next);
    setNewTitle("");
    setAddingTo(null);
  }

  function removeCard(col: ColKey, id: string) {
    const next = { ...board, [col]: board[col].filter((c) => c.id !== id) };
    update(next);
  }

  function onDrop(targetCol: ColKey) {
    if (!dragCard || dragCard.col === targetCol) return;
    const card = board[dragCard.col].find((c) => c.id === dragCard.id);
    if (!card) return;
    const next = {
      ...board,
      [dragCard.col]: board[dragCard.col].filter((c) => c.id !== dragCard.id),
      [targetCol]: [...board[targetCol], card],
    };
    update(next);
    setDragCard(null);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
          <Layers size={18} />
        </div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Kanban</h1>
      </div>

      <div className="grid grid-cols-4 gap-3 min-h-[500px]">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="flex flex-col gap-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--fg-dim)" }}>{col.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-dimmer)" }}>{board[col.key].length}</span>
              </div>
              <button onClick={() => setAddingTo(col.key === addingTo ? null : col.key)} className="p-1 rounded-md transition hover:bg-white/5" style={{ color: "var(--fg-dimmer)" }}>
                <Plus size={13} />
              </button>
            </div>

            {/* Add form */}
            {addingTo === col.key && (
              <div className="panel p-2.5 space-y-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCard(col.key); if (e.key === "Escape") setAddingTo(null); }}
                  placeholder="Card title…"
                  className="w-full bg-transparent text-xs outline-none"
                  style={{ color: "var(--fg)", borderBottom: "1px solid var(--panel-border)", paddingBottom: "4px" }}
                />
                <div className="flex gap-1 flex-wrap">
                  {TAG_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewTag(c)} className="w-4 h-4 rounded-full transition" style={{ background: c, outline: newTag === c ? `2px solid ${c}` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => addCard(col.key)} className="text-[10px] px-2 py-1 rounded" style={{ background: "var(--accent)", color: "#fff" }}>Add</button>
                  <button onClick={() => setAddingTo(null)} className="text-[10px] px-2 py-1 rounded" style={{ color: "var(--fg-dimmer)" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Cards */}
            <div className="flex-1 space-y-2" style={{ minHeight: "200px" }}>
              {board[col.key].map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragCard({ id: card.id, col: col.key })}
                  className="panel p-3 cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {card.tag && <span className="inline-block w-2 h-2 rounded-full mr-1.5 mb-1" style={{ background: card.tag }} />}
                      <span className="text-xs leading-relaxed" style={{ color: "var(--fg)" }}>{card.title}</span>
                    </div>
                    <button onClick={() => removeCard(col.key, card.id)} className="opacity-0 group-hover:opacity-100 transition shrink-0" style={{ color: "var(--fg-dimmer)" }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
