"use client";

import { useState, useRef } from "react";
import { ExternalLink, RotateCw, Building2, AlertTriangle } from "lucide-react";

// Opens straight to the Goldie Labs demo company's org chart. Change to
// "http://localhost:3100" for the plain root / last-viewed company.
const PAPERCLIP_URL = "http://localhost:3100/GOLA/org";

export default function PaperclipRoute() {
  const [iframeKey, setIframeKey] = useState(0);
  const [errored, setErrored] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl border" style={{ borderColor: "rgba(212,165,116,0.4)", background: "rgba(212,165,116,0.12)", color: "#d4a574" }}>
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Paperclip</h1>
            <div className="text-[12.5px] text-[var(--fg-dim)]">Your AI company — orchestrating Hermes &amp; your agents · <span className="font-mono">localhost:3100</span></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setErrored(false); setIframeKey((k) => k + 1); }} title="Reload"
            className="p-2 rounded-lg border border-[var(--panel-border)] hover:border-[var(--panel-border-hot)] text-[var(--fg-dim)]"><RotateCw size={15} /></button>
          <a href={PAPERCLIP_URL} target="_blank" rel="noopener noreferrer" title="Open in a new tab"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--panel-border)] hover:border-[var(--panel-border-hot)] text-[12.5px] text-[var(--fg-dim)]"><ExternalLink size={14} /> Open full</a>
        </div>
      </div>

      {/* embedded Paperclip */}
      <div className="flex-1 min-h-0 rounded-2xl border border-[var(--panel-border)] overflow-hidden bg-black/30 relative">
        {errored ? (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div className="max-w-[440px]">
              <AlertTriangle size={26} className="mx-auto mb-3 text-amber-400" />
              <div className="text-[15px] text-[var(--fg)] mb-2">Paperclip isn&apos;t responding on :3100</div>
              <p className="text-[13px] text-[var(--fg-dim)] leading-relaxed mb-4">Start it in a terminal, then hit reload:</p>
              <code className="block text-[12.5px] font-mono bg-[var(--bg-mid)] border border-[var(--panel-border)] rounded-lg px-3 py-2 text-[var(--fg-dim)]">cd ~/paperclip &amp;&amp; pnpm dev</code>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            ref={ref}
            src={PAPERCLIP_URL}
            title="Paperclip"
            className="w-full h-full border-0"
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>
  );
}
