"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Mic, MicOff, Clock } from "lucide-react";

interface Entry { id: string; content: string; ts: string; }

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function JournalView() {
  const [date, setDate] = useState(toDateStr(new Date()));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/journal?date=${date}`)
      .then((r) => r.json())
      .then((j) => setEntries(j.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [date]);

  async function addEntry() {
    if (!draft.trim()) return;
    setSaving(true);
    const entry: Entry = { id: crypto.randomUUID(), content: draft.trim(), ts: new Date().toISOString() };
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, entry }),
      });
    } catch { /* graceful */ }
    setEntries((e) => [entry, ...e]);
    setDraft("");
    setSaving(false);
  }

  function toggleMic() {
    type SR = { new(): { onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void; onend: () => void; start: () => void } };
    const SRClass = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as SR | undefined;
    if (!SRClass || listening) { setListening(false); return; }
    const rec = new SRClass();
    rec.onresult = (e) => setDraft((p) => p + e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            <BookOpen size={18} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Journal</h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm bg-transparent outline-none"
          style={{ border: "1px solid var(--panel-border)", color: "var(--fg)", colorScheme: "dark" }}
        />
      </div>

      {/* New entry */}
      <div className="panel p-4 space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's on your mind today…"
          rows={4}
          className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed"
          style={{ color: "var(--fg)", caretColor: "var(--accent)", borderBottom: "1px solid var(--panel-border)", paddingBottom: "12px" }}
        />
        <div className="flex items-center justify-between">
          <button onClick={toggleMic} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition" style={{ color: listening ? "var(--accent)" : "var(--fg-dim)", background: listening ? "var(--accent-dim)" : "transparent" }}>
            {listening ? <MicOff size={13} /> : <Mic size={13} />}
            {listening ? "Listening…" : "Voice"}
          </button>
          <button
            onClick={addEntry}
            disabled={!draft.trim() || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition"
            style={{ background: "var(--accent)", color: "#fff", opacity: !draft.trim() ? 0.5 : 1 }}
          >
            <Plus size={14} /> {saving ? "Saving…" : "Add Entry"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="animate-pulse text-sm text-center py-8" style={{ color: "var(--fg-dim)" }}>Loading entries…</div>
      ) : entries.length === 0 ? (
        <div className="panel p-10 text-center">
          <BookOpen size={28} className="mx-auto mb-3" style={{ color: "var(--fg-dimmer)" }} />
          <p className="text-sm" style={{ color: "var(--fg-dim)" }}>No entries for {date}</p>
        </div>
      ) : (
        <div className="relative space-y-4 pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 rounded-full" style={{ background: "var(--panel-border)" }} />
          {entries.map((e) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-4 top-3 w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <div className="panel p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--fg-dimmer)" }}>
                  <Clock size={10} /> {fmtTime(e.ts)}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg)" }}>{e.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
