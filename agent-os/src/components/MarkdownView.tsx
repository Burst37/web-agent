"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownView({ src }: { src: string }) {
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(src)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); })
      .then((text) => { setMd(text); setLoading(false); })
      .catch((e) => { setError(`Could not load ${src}: ${e.message}`); setLoading(false); });
  }, [src]);

  if (loading) return (
    <div className="panel p-8 space-y-2 animate-pulse">
      {[80, 60, 100, 70, 90].map((w, i) => (
        <div key={i} className="h-3 rounded" style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)" }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="panel p-8 text-center">
      <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
    </div>
  );

  return (
    <div className="panel p-6 md:p-8">
      <div
        className="prose-custom"
        style={
          {
            "--prose-h1": "var(--fg)",
            "--prose-h2": "var(--fg)",
            "--prose-h3": "var(--fg-dim)",
            "--prose-p": "var(--fg-dim)",
            "--prose-code": "#8cba80",
          } as React.CSSProperties
        }
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "1.75rem", fontWeight: 700, color: "var(--fg)", marginBottom: "1rem", letterSpacing: "-0.02em" }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--fg)", margin: "2rem 0 0.75rem", letterSpacing: "-0.02em" }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--fg-dim)", margin: "1.5rem 0 0.5rem" }}>{children}</h3>,
            p: ({ children }) => <p style={{ color: "var(--fg-dim)", lineHeight: 1.75, marginBottom: "0.875rem", fontSize: "0.9rem" }}>{children}</p>,
            code: ({ children, className }) => {
              const block = className?.includes("language-");
              return block
                ? <code style={{ display: "block", background: "rgba(0,0,0,0.5)", borderRadius: "0.5rem", padding: "1rem", fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem", color: "#8cba80", overflowX: "auto", border: "1px solid var(--panel-border)", marginBottom: "1rem" }}>{children}</code>
                : <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8em", color: "#8cba80", background: "rgba(0,0,0,0.3)", padding: "0.1em 0.4em", borderRadius: "0.25rem" }}>{children}</code>;
            },
            pre: ({ children }) => <pre style={{ margin: "1rem 0" }}>{children}</pre>,
            ul: ({ children }) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "0.875rem", color: "var(--fg-dim)", listStyleType: "disc", fontSize: "0.9rem", lineHeight: 1.75 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "0.875rem", color: "var(--fg-dim)", listStyleType: "decimal", fontSize: "0.9rem", lineHeight: 1.75 }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: "0.25rem" }}>{children}</li>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "1rem", color: "var(--fg-dim)", opacity: 0.8, margin: "1rem 0", fontStyle: "italic" }}>{children}</blockquote>,
            strong: ({ children }) => <strong style={{ color: "var(--fg)", fontWeight: 600 }}>{children}</strong>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline", textDecorationColor: "rgba(217,119,87,0.4)" }}>{children}</a>,
            hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--panel-border)", margin: "2rem 0" }} />,
          }}
        >
          {md}
        </ReactMarkdown>
      </div>
    </div>
  );
}
