"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ChevronDown, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

const AGENTS = ["claude", "openclaw", "gemini", "hermes"];

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UnifiedChat({
  defaultAgent,
  showAgentSwitcher,
}: {
  defaultAgent: string;
  showAgentSwitcher: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState(defaultAgent);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim(), ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: input.trim() }),
      });
      if (!r.ok) throw new Error("not configured");
      const j = await r.json();
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: j.reply || j.content || "...", ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Agent "${agent}" is not configured yet. Set up the API routes to enable live responses.`, ts: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleVoice() {
    type SRInstance = { lang: string; onresult: (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void; onerror: () => void; onend: () => void; start: () => void };
    type SRClass = { new(): SRInstance };
    const SR = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as SRClass | undefined;
    if (!SR) return;
    if (listening) { setListening(false); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e) => setInput(prev => prev + e.results[0][0].transcript);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  return (
    <div className="panel flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
      {/* Header */}
      {showAgentSwitcher && (
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <Bot size={15} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--fg-dim)" }}>Agent:</span>
          <div className="relative">
            <select
              value={agent}
              onChange={e => setAgent(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)", color: "var(--fg)" }}
            >
              {AGENTS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--fg-dimmer)" }} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: "var(--accent-dim)", border: "1px solid var(--panel-border)" }}>
              <Bot size={24} style={{ color: "var(--accent)" }} />
            </div>
            <div className="text-sm text-center" style={{ color: "var(--fg-dim)" }}>
              Start a conversation with {agent}
            </div>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className="w-7 h-7 rounded-full grid place-items-center shrink-0 mt-0.5"
              style={{
                background: m.role === "user" ? "var(--accent-dim)" : "rgba(100,60,140,0.3)",
                border: "1px solid var(--panel-border)",
              }}
            >
              {m.role === "user" ? <User size={13} style={{ color: "var(--accent)" }} /> : <Bot size={13} style={{ color: "#a78bfa" }} />}
            </div>
            <div className={`max-w-[80%] space-y-1 ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: m.role === "user" ? "var(--accent-dim)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${m.role === "user" ? "rgba(217,119,87,0.3)" : "var(--panel-border)"}`,
                  color: "var(--fg)",
                  borderBottomRightRadius: m.role === "user" ? "4px" : undefined,
                  borderBottomLeftRadius: m.role === "assistant" ? "4px" : undefined,
                }}
              >
                <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
              </div>
              <span className="text-[10px] px-1" style={{ color: "var(--fg-dimmer)" }}>{formatTime(m.ts)}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(100,60,140,0.3)", border: "1px solid var(--panel-border)" }}>
              <Bot size={13} style={{ color: "#a78bfa" }} />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)" }}>
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--fg-dimmer)", animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--panel-border)" }}>
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{ background: "var(--bg-mid)", border: "1px solid var(--panel-border)" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${agent}…`}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-1"
            style={{ color: "var(--fg)", caretColor: "var(--accent)", maxHeight: "120px" }}
          />
          <div className="flex gap-1.5 mb-0.5">
            <button onClick={toggleVoice} className="p-1.5 rounded-lg transition" style={{ background: listening ? "rgba(217,119,87,0.2)" : "transparent", color: listening ? "var(--accent)" : "var(--fg-dimmer)" }}>
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="p-1.5 rounded-lg transition"
              style={{ background: input.trim() ? "var(--accent)" : "transparent", color: input.trim() ? "#fff" : "var(--fg-dimmer)" }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
        <div className="text-[10px] mt-1.5 pl-1" style={{ color: "var(--fg-dimmer)" }}>Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}
