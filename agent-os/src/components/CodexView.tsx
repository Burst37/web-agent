"use client";

import { useState, useEffect } from "react";
import { FileCode, Search, Hash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Heading { text: string; level: number; id: string; }

function extractHeadings(md: string): Heading[] {
  const lines = md.split("\n");
  return lines
    .filter((l) => /^#{1,3}\s/.test(l))
    .map((l) => {
      const m = l.match(/^(#{1,3})\s+(.+)/);
      if (!m) return null;
      const text = m[2].replace(/[*_`]/g, "");
      return { level: m[1].length, text, id: text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") };
    })
    .filter(Boolean) as Heading[];
}

export default function CodexView() {
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    fetch("/api/guide")
      .then((r) => r.text())
      .then((text) => {
        setMd(text);
        setHeadings(extractHeadings(text));
        setLoading(false);
      })
      .catch(() => {
        setError("Codex guide not available at /api/guide");
        setLoading(false);
      });
  }, []);

  const filteredHeadings = headings.filter((h) => h.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0 panel flex flex-col overflow-hidden" style={{ alignSelf: "start", position: "sticky", top: 0, maxHeight: "calc(100vh - 160px)" }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-dimmer)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter headings…"
              className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[11px] bg-transparent outline-none"
              style={{ border: "1px solid var(--panel-border)", color: "var(--fg)" }}
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredHeadings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={() => setActiveId(h.id)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition block"
              style={{
                paddingLeft: h.level === 1 ? 8 : h.level === 2 ? 16 : 24,
                color: activeId === h.id ? "var(--fg)" : "var(--fg-dim)",
                background: activeId === h.id ? "var(--accent-dim)" : "transparent",
              }}
            >
              <Hash size={10} style={{ color: "var(--fg-dimmer)", flexShrink: 0 }} />
              {h.text}
            </a>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 panel overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b sticky top-0 z-10" style={{ borderColor: "var(--panel-border)", background: "var(--bg-panel)" }}>
          <FileCode size={14} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Codex</span>
        </div>
        <div className="p-6">
          {loading && <div className="animate-pulse text-sm" style={{ color: "var(--fg-dim)" }}>Loading codex…</div>}
          {error && <div className="text-sm" style={{ color: "#f87171" }}>{error}</div>}
          {md && (
            <div className="prose prose-sm max-w-none" style={{ "--tw-prose-body": "var(--fg)", "--tw-prose-headings": "var(--fg)", "--tw-prose-code": "#8cba80" } as React.CSSProperties}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
