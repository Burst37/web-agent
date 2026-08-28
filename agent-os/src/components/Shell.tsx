"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Box, Sparkles, Target, BookOpen,
  Layers, Zap, Brain, FileCode, Film, Video, Building2, Cpu, Navigation,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const NAV: NavItem[] = [
  { href: "/",          label: "Overview",   icon: <LayoutDashboard size={15} /> },
  { href: "/claude",    label: "Claude",     icon: <MessageSquare size={15} /> },
  { href: "/openclaw",  label: "OpenClaw",   icon: <Box size={15} /> },
  { href: "/gemini",    label: "Gemini",     icon: <Sparkles size={15} /> },
  { href: "/goals",     label: "Goals",      icon: <Target size={15} /> },
  { href: "/journal",   label: "Journal",    icon: <BookOpen size={15} /> },
  { href: "/kanban",    label: "Kanban",     icon: <Layers size={15} /> },
  { href: "/pipeline",  label: "Pipeline",   icon: <Zap size={15} /> },
  { href: "/memory",    label: "Memory",     icon: <Brain size={15} /> },
  { href: "/codex",     label: "Codex",      icon: <FileCode size={15} /> },
  { href: "/studio",    label: "Studio",     icon: <Film size={15} /> },
  { href: "/video",     label: "Video",      icon: <Video size={15} /> },
  { href: "/paperclip", label: "Paperclip",  icon: <Building2 size={15} /> },
  { href: "/ruflo",     label: "Ruflo",      icon: <Cpu size={15} /> },
  { href: "/guide",     label: "Guide",      icon: <BookOpen size={15} /> },
];

interface Vitals {
  claude?: { ok: boolean };
  openclaw?: { ok: boolean };
  hermes?: { ok: boolean };
  gemini?: { ok: boolean };
}

function StatusDot({ ok, label }: { ok: boolean | undefined; label: string }) {
  const color = ok === undefined ? "#6b5f55" : ok ? "#4ade80" : "#f87171";
  return (
    <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--fg-dimmer)" }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: ok ? `0 0 6px ${color}` : "none" }} />
      {label}
    </span>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [vitals, setVitals] = useState<Vitals>({});

  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/vitals", { cache: "no-store" })
        .then(r => r.json())
        .then(setVitals)
        .catch(() => {});
    fetch_();
    const t = setInterval(fetch_, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: "var(--sidebar-w)",
          background: "var(--bg-mid)",
          borderRight: "1px solid var(--panel-border)",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl grid place-items-center shrink-0"
              style={{ background: "var(--accent)", boxShadow: "0 0 20px -6px var(--accent)" }}
            >
              <Navigation size={15} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none" style={{ fontFamily: "Bricolage Grotesque, sans-serif", color: "var(--fg)" }}>
                Agent OS
              </div>
              <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "var(--fg-dimmer)" }}>
                Mission Control
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 pb-4 space-y-0.5">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-[12.5px] font-medium relative group"
                style={{
                  background: active ? "rgba(217,119,87,0.14)" : "transparent",
                  color: active ? "var(--fg)" : "var(--fg-dim)",
                }}
              >
                <span style={{ color: active ? "var(--accent)" : "var(--fg-dimmer)" }}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Vitals status */}
        <div
          className="mx-2.5 mb-4 px-3 py-2.5 rounded-xl space-y-1.5"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--panel-border)" }}
        >
          <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--fg-dimmer)" }}>Agents</div>
          <StatusDot ok={vitals.claude?.ok} label="Claude" />
          <StatusDot ok={vitals.openclaw?.ok} label="OpenClaw" />
          <StatusDot ok={vitals.hermes?.ok} label="Hermes" />
          <StatusDot ok={vitals.gemini?.ok} label="Gemini" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
