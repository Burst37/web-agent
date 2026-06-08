"use client";

import { useState, useEffect, useRef } from "react";
import { Film, Upload, Image as ImageIcon, FileVideo, FileAudio, X } from "lucide-react";

interface MediaFile { id: string; name: string; type: string; url?: string; size?: number; }

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image")) return <ImageIcon size={20} style={{ color: "#60a5fa" }} />;
  if (type.startsWith("video")) return <FileVideo size={20} style={{ color: "#f472b6" }} />;
  return <FileAudio size={20} style={{ color: "#4ade80" }} />;
}

export default function MediaView() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((j) => setFiles(j.files || []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files;
    if (!f) return;
    Array.from(f).forEach((file) => {
      const item: MediaFile = { id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) };
      setFiles((prev) => [item, ...prev]);
    });
  }

  function remove(id: string) { setFiles((f) => f.filter((x) => x.id !== id)); }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(217,119,87,0.15)", color: "var(--accent)" }}>
            <Film size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Studio</h1>
            <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Media files & assets</p>
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Upload size={15} /> Upload
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: "var(--bg-panel)" }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="panel p-16 text-center">
          <Film size={36} className="mx-auto mb-4" style={{ color: "var(--fg-dimmer)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>No media yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--fg-dim)" }}>Upload files to get started</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition"
            style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(217,119,87,0.3)" }}
          >
            <Upload size={14} /> Upload files
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {files.map((f) => (
            <div key={f.id} className="panel group relative aspect-square overflow-hidden flex flex-col items-center justify-center p-2 gap-1">
              {f.url && f.type.startsWith("image") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 flex-1">
                  <FileIcon type={f.type} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2">
                <p className="text-[10px] font-medium truncate" style={{ color: "#fff" }}>{f.name}</p>
                {f.size && <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.6)" }}>{formatSize(f.size)}</p>}
              </div>
              <button
                onClick={() => remove(f.id)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
