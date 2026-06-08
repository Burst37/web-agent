"use client";

import { useState } from "react";
import { Zap, Copy, Check } from "lucide-react";

export default function UltracodeView() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("typescript");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setCode("");
    try {
      const r = await fetch("/api/ultracode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lang }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      setCode(j.code || j.output || "// No output");
    } catch {
      setCode("// Ultracode endpoint not configured.\n// Set up /api/ultracode to enable AI code generation.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.2)", color: "var(--accent)", boxShadow: "0 0 24px -8px var(--accent)" }}>
          <Zap size={18} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Ultracode</h2>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>AI-powered code generation via Claude</p>
        </div>
      </div>

      {/* Prompt + lang */}
      <div className="panel p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--fg-dimmer)" }}>Language</label>
          {["typescript", "python", "bash", "go", "rust"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-2.5 py-1 rounded-lg text-xs transition"
              style={{ background: lang === l ? "var(--accent-dim)" : "transparent", border: `1px solid ${lang === l ? "var(--accent)" : "var(--panel-border)"}`, color: lang === l ? "var(--fg)" : "var(--fg-dim)" }}
            >
              {l}
            </button>
          ))}
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
          placeholder="Describe the code you want to generate… (⌘+Enter)"
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
          style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)", caretColor: "var(--accent)" }}
        />
        <button
          onClick={generate}
          disabled={!prompt.trim() || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
          style={{ background: "var(--accent)", color: "#fff", opacity: !prompt.trim() || loading ? 0.5 : 1 }}
        >
          {loading ? <span className="animate-spin">⟳</span> : <Zap size={14} />}
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {/* Output */}
      {code && (
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--panel-border)" }}>
            <span className="text-xs font-mono" style={{ color: "var(--fg-dimmer)" }}>{lang}</span>
            <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition" style={{ background: "var(--bg-mid)", color: "var(--fg-dim)", border: "1px solid var(--panel-border)" }}>
              {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <pre
            className="overflow-x-auto p-4 text-xs leading-relaxed"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#8cba80", background: "rgba(0,0,0,0.4)", maxHeight: "500px", overflowY: "auto" }}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
