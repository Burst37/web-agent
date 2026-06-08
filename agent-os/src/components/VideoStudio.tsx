"use client";

import { useState, useEffect } from "react";
import { Video, Plus, ExternalLink, Film, Loader } from "lucide-react";

interface Project { slug: string; title?: string; preview?: string; status?: string; nextStep?: string; createdAt?: string; }

export default function VideoStudio() {
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/video/hyperframes/projects")
      .then((r) => r.json())
      .then((j) => setProjects(j.projects || []))
      .catch(() => setProjects([]));
  }, []);

  async function create() {
    if (!prompt.trim() || creating) return;
    setCreating(true);
    try {
      const r = await fetch("/api/video/hyperframes/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      const p: Project = j.project || { slug: crypto.randomUUID().slice(0, 8), title: prompt, status: "initializing", nextStep: "Configure scenes" };
      setProjects((prev) => [p, ...prev]);
      setPrompt("");
    } catch {
      const fake: Project = { slug: `demo-${Date.now()}`, title: prompt, status: "draft", nextStep: "Set up /api/video/hyperframes/init to create real projects", createdAt: new Date().toISOString() };
      setProjects((prev) => [fake, ...prev]);
      setPrompt("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6" }}>
          <Video size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>HyperFrames</h1>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>AI video project studio</p>
        </div>
      </div>

      {/* Create form */}
      <div className="panel p-5 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: "var(--fg-dimmer)" }}>Video Concept</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video concept, story, or scene…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
            style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)", caretColor: "#f472b6" }}
          />
        </div>
        <button
          onClick={create}
          disabled={!prompt.trim() || creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition"
          style={{ background: "#f472b6", color: "#fff", opacity: !prompt.trim() || creating ? 0.5 : 1 }}
        >
          {creating ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
          {creating ? "Creating Project…" : "Create Project"}
        </button>
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--fg-dim)", fontFamily: "Bricolage Grotesque, sans-serif" }}>Projects</h2>
        {loading ? (
          <div className="text-sm animate-pulse" style={{ color: "var(--fg-dim)" }}>Loading…</div>
        ) : projects.length === 0 ? (
          <div className="panel p-10 text-center">
            <Film size={28} className="mx-auto mb-3" style={{ color: "var(--fg-dimmer)" }} />
            <p className="text-sm" style={{ color: "var(--fg-dim)" }}>No projects yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--fg-dimmer)" }}>Create your first video project above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((p) => (
              <div key={p.slug} className="panel p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold leading-snug" style={{ fontFamily: "Bricolage Grotesque, sans-serif", color: "var(--fg)" }}>
                      {p.title || p.slug}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--fg-dimmer)" }}>{p.slug}</div>
                  </div>
                  {p.status && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(244,114,182,0.12)", color: "#f472b6" }}>
                      {p.status}
                    </span>
                  )}
                </div>
                {p.nextStep && (
                  <div className="text-[11px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>
                    Next: {p.nextStep}
                  </div>
                )}
                <div className="flex gap-2">
                  {p.preview && (
                    <a
                      href={p.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition"
                      style={{ background: "rgba(244,114,182,0.1)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.2)" }}
                    >
                      <ExternalLink size={10} /> Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
